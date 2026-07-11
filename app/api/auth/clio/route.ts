import { randomBytes } from "crypto";

import { getAppEnv } from "@/lib/env";
import { NextResponse } from "next/server";

const STATE_COOKIE = "clio_oauth_state";

export async function GET() {
  const env = getAppEnv();
  const state = randomBytes(32).toString("base64url");
  const authorizeUrl = new URL(env.clioAuthorizeUrl);

  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", env.clioClientId);
  authorizeUrl.searchParams.set("redirect_uri", env.clioRedirectUri);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("redirect_on_decline", "true");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
