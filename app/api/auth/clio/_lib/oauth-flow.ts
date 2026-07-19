import { createHash, randomBytes } from "crypto";

import { getAppEnv } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

const STATE_COOKIE = "clio_oauth_state";
const CODE_VERIFIER_COOKIE = "clio_oauth_code_verifier";
const OAUTH_COOKIE_TTL_SECONDS = 10 * 60;

export function getExpectedOAuthState(request: NextRequest): string | undefined {
  return request.cookies.get(STATE_COOKIE)?.value;
}

export function getExpectedOAuthCodeVerifier(
  request: NextRequest,
): string | undefined {
  return request.cookies.get(CODE_VERIFIER_COOKIE)?.value;
}

function getCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function createClioAuthorizeResponse(): NextResponse {
  const env = getAppEnv();
  const state = randomBytes(32).toString("base64url");
  const codeVerifier = randomBytes(64).toString("base64url");
  const authorizeUrl = new URL(env.clioAuthorizeUrl);
  const isSecureAppOrigin = new URL(env.appOrigin).protocol === "https:";

  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", env.clioClientId);
  authorizeUrl.searchParams.set("redirect_uri", env.clioRedirectUri);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("redirect_on_decline", "true");
  authorizeUrl.searchParams.set("code_challenge", getCodeChallenge(codeVerifier));
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizeUrl);
  const oauthCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecureAppOrigin,
    path: "/",
    maxAge: OAUTH_COOKIE_TTL_SECONDS,
  };

  response.cookies.set({
    ...oauthCookieOptions,
    name: STATE_COOKIE,
    value: state,
  });
  response.cookies.set({
    ...oauthCookieOptions,
    name: CODE_VERIFIER_COOKIE,
    value: codeVerifier,
  });

  return response;
}

export function redirectToGenerator(
  _request: NextRequest,
  params: Record<string, string>,
): NextResponse {
  const url = new URL("/", getAppEnv().appOrigin);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(CODE_VERIFIER_COOKIE);
  return response;
}
