/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import config from "./app-config";
// import { authCookie } from "~/cookies.server";

export interface iAxios<ParamObjectType, DataObjectType> {
  url: string;
  params?: ParamObjectType;
  data?: DataObjectType;
  method?: string;
  dataType?: "FormData" | "application/json";
  headers?: Record<string, string>;
}

export const fetchApi = <T extends z.ZodTypeAny>(
  info: iAxios<any | FormData, any>,
  responseSchema: T | null = null,
  request: Request
): Promise<z.infer<T>> => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (cookieHeader && cookieHeader) || {};
  const authValue = getAuthValue(typeof cookie === "string" ? cookie : "");
  // const decodedToken = decodeBase64(authValue || "");

  const token = authValue ? authValue.replace(/^"|"$/g, "") : "";

  // console.log(
  //   "Decoded Token:",
  //   authValue ? authValue.replace(/^"|"$/g, "") : ""
  // );

  return new Promise((resolve, reject) => {
    const {
      url,
      params = {},
      data = {},
      method = "get",
      headers: h = {},
    } = info;

    let { dataType = "application/json" } = info;

    if (data instanceof FormData) dataType = "FormData";

    const headers = {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(dataType === "application/json"
        ? {
            "Content-Type": "application/json;charset=UTF-8",
          }
        : {}),
      ...h,
    };

    const u = new URL("/api" + url, config.BACKEND_API_BASE_URL);
    const s = new URLSearchParams(params).toString();
    const fullUrl = s?.length ? u + "?" + s : u;

    const body =
      method !== "get" && method !== "head"
        ? dataType === "FormData"
          ? data instanceof FormData
            ? data
            : getFormData(data)
          : JSON.stringify(data)
        : undefined;

    fetch(fullUrl, {
      method: method.toUpperCase(),
      headers,
      // if body exists then use it, otherwise ignore it
      ...(body ? { body } : {}),
    })
      .then(async (res) => {
        if (res.ok) {
          const resData = await res.json();
          if (responseSchema) {
            // const { error } = responseSchema.safeParse(resData);
            // if (error) {
            //   console.error(
            //     `Response Validation Failed at ${method} ${u}: `,
            //     error
            //   );
            // }
          }
          resolve(resData);
        } else {
          const error = await res
            .json()
            .catch(() => res.text().catch(() => res));
          console.log({ info, error });
          reject(error);
        }
      })
      .catch(reject);
  });
};

const getFormData = (object: any) =>
  Object.keys(object).reduce((formData, key) => {
    if (typeof object[key] !== "undefined")
      formData.append(
        key,
        typeof object[key] !== "object" || object[key] instanceof File
          ? object[key]
          : JSON.stringify(object[key])
      );
    return formData;
  }, new FormData());

export function getAuthValue(cookieString: string) {
  if (cookieString === "") return null;
  const match = cookieString?.match(/auth=([^;]+)/);
  return match ? match[1] : null;
}

// function decodeBase64(encodedStr: string) {
//   try {
//     return JSON.parse(atob(encodedStr));
//   } catch (error) {
//     console.error("Failed to decode Base64:", error);
//     return null;
//   }
// }
