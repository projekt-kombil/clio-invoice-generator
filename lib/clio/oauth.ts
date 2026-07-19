import { deleteClioTokens, loadClioTokens, saveClioTokens } from "@/lib/clio-token-store";
import type { ClioTokenResponse } from "@/lib/clio/types";
import { getAppEnv } from "@/lib/env";

const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

function getTokenExpiry(expiresInSeconds: number): number {
  return Date.now() + expiresInSeconds * 1000;
}

async function postForm<T>(url: string, body: URLSearchParams): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const responseText = await response.text();
    const details = responseText.trim()
      ? ` ${responseText.trim().slice(0, 500)}`
      : "";

    throw new Error(
      `Clio token request failed with status ${response.status}.${details}`,
    );
  }

  return (await response.json()) as T;
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<void> {
  const env = getAppEnv();
  const tokenResponse = await postForm<ClioTokenResponse>(
    env.clioTokenUrl,
    new URLSearchParams({
      client_id: env.clioClientId,
      client_secret: env.clioClientSecret,
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: env.clioRedirectUri,
    }),
  );

  if (!tokenResponse.refresh_token) {
    throw new Error("Clio did not return a refresh token.");
  }

  await saveClioTokens({
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: getTokenExpiry(tokenResponse.expires_in),
  });
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const env = getAppEnv();
  const tokenResponse = await postForm<ClioTokenResponse>(
    env.clioTokenUrl,
    new URLSearchParams({
      client_id: env.clioClientId,
      client_secret: env.clioClientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );

  const nextRefreshToken = tokenResponse.refresh_token ?? refreshToken;

  await saveClioTokens({
    accessToken: tokenResponse.access_token,
    refreshToken: nextRefreshToken,
    expiresAt: getTokenExpiry(tokenResponse.expires_in),
  });

  return tokenResponse.access_token;
}

export async function getValidClioAccessToken(): Promise<string | null> {
  const tokens = await loadClioTokens();

  if (!tokens) {
    return null;
  }

  if (tokens.expiresAt > Date.now() + TOKEN_REFRESH_WINDOW_MS) {
    return tokens.accessToken;
  }

  try {
    return await refreshAccessToken(tokens.refreshToken);
  } catch {
    await deleteClioTokens();
    return null;
  }
}
