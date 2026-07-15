import { randomBytes } from "crypto";

import { getAppEnv } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

const STATE_COOKIE = "clio_oauth_state";
const STATE_COOKIE_TTL_SECONDS = 10 * 60;

export function getExpectedOAuthState(request: NextRequest): string | undefined {
  return request.cookies.get(STATE_COOKIE)?.value;
}

export function createClioAuthorizeResponse(): NextResponse {
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
    maxAge: STATE_COOKIE_TTL_SECONDS,
  });

  return response;
}

export function redirectToGenerator(
  request: NextRequest,
  params: Record<string, string>,
): NextResponse {
  const url = new URL("/", request.url);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  return response;
}
