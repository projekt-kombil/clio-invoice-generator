import { deleteClioTokens, loadClioTokens, saveClioTokens } from "@/lib/clio-token-store";
import { getCurrentClioSessionUserId } from "@/lib/clio/session";
import type {
  ClioCurrentUser,
  ClioTokenResponse,
  ClioWhoAmIResponse,
} from "@/lib/clio/types";
import { getAppEnv } from "@/lib/env";

const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

function getTokenExpiry(expiresInSeconds: number): number {
  return Date.now() + expiresInSeconds * 1000;
}

export function getClioAppUserId(clioUserId: number): string {
  return `clio:${clioUserId}`;
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
    throw new Error(`Clio token request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

async function getCurrentClioUserWithAccessToken(
  accessToken: string,
): Promise<ClioCurrentUser> {
  const env = getAppEnv();
  const response = await fetch(`${env.clioBaseUrl}/users/who_am_i?fields=id,name`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Clio current-user request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ClioWhoAmIResponse;
  const id = payload.data?.id;
  const name = payload.data?.name;

  if (typeof id !== "number" || typeof name !== "string") {
    throw new Error("Clio current-user response did not include the expected fields.");
  }

  return { id, name };
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<string> {
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

  const user = await getCurrentClioUserWithAccessToken(tokenResponse.access_token);
  const userId = getClioAppUserId(user.id);

  await saveClioTokens({
    userId,
    clioUserId: String(user.id),
    displayName: user.name,
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: getTokenExpiry(tokenResponse.expires_in),
  });

  return userId;
}

async function refreshAccessToken(
  userId: string,
  refreshToken: string,
): Promise<string> {
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
    userId,
    accessToken: tokenResponse.access_token,
    refreshToken: nextRefreshToken,
    expiresAt: getTokenExpiry(tokenResponse.expires_in),
  });

  return tokenResponse.access_token;
}

export async function getValidClioAccessToken(): Promise<string | null> {
  const userId = await getCurrentClioSessionUserId();

  if (!userId) {
    return null;
  }

  const tokens = await loadClioTokens(userId);

  if (!tokens) {
    return null;
  }

  if (tokens.expiresAt > Date.now() + TOKEN_REFRESH_WINDOW_MS) {
    return tokens.accessToken;
  }

  try {
    return await refreshAccessToken(userId, tokens.refreshToken);
  } catch {
    await deleteClioTokens(userId);
    return null;
  }
}
