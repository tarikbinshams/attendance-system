import { fetchApi } from "config/api-config";
import { z } from "zod";

export async function login(payload: {
  email: string;
  password: string;
  request: Request;
}) {
  const { request, ...rest } = payload;
  const response = await fetchApi(
    {
      url: "/auth/login",
      method: "post",
      data: rest,
    },
    z.object({
      token: z.string(),
      error: z.string().optional(),
    }),
    request
  );
  return response;
}

export async function getUserActivity(request: Request) {
  const response = await fetchApi(
    {
      url: "/users/activity",
      method: "get",
      //   data: { noData: true },
    },
    z.object({
      activities: z.array(
        z.object({
          _id: z.string(),
          type: z.string(),
          created_at: z.string(),
          user: z.object({
            _id: z.string(),
            name: z.string(),
            email: z.string(),
          }),
        })
      ),
      error: z.string().optional(),
    }),
    request
  );
  return response;
}

export async function logout(request: Request) {
  const response = await fetchApi(
    {
      url: "/auth/logout",
      method: "post",
    },
    z.object({
      message: z.string(),
      error: z.string().optional(),
    }),
    request
  );
  return response;
}

export async function getUsers(request: Request) {
  const response = await fetchApi(
    {
      url: "/users",
      method: "get",
    },
    z.object({
      users: z.array(
        z.object({
          _id: z.string(),
          name: z.string(),
          email: z.string(),
        })
      ),
      error: z.string().optional(),
    }),
    request
  );
  return response;
}
