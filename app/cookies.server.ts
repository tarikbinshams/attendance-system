import { createCookie } from "@remix-run/node"; // or cloudflare/deno
import createForeignCookie from "./create-foreign-cookie.server";

export const authCookie = createCookie("auth", {
  httpOnly: true,
  secure: true,
});

export const sbRefreshTokenCookie = createForeignCookie("sb-refresh-token");
