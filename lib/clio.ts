import "server-only";

import { deleteClioTokens, loadClioTokens, saveClioTokens } from "@/lib/clio-token-store";
import { getAppEnv } from "@/lib/env";

const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

type ClioTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

type ClioWhoAmIResponse = {
  data?: {
    id?: number;
    name?: string;
  };
};

type ClioApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export type ClioCurrentUser = {
  id: number;
  name: string;
};

export type ClioConnectionStatus =
  | {
      connected: true;
      user: ClioCurrentUser;
    }
  | {
      connected: false;
      reason?: string;
    };

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
    throw new Error(`Clio token request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function exchangeAuthorizationCode(code: string): Promise<void> {
  const env = getAppEnv();
  const tokenResponse = await postForm<ClioTokenResponse>(
    env.clioTokenUrl,
    new URLSearchParams({
      client_id: env.clioClientId,
      client_secret: env.clioClientSecret,
      grant_type: "authorization_code",
      code,
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

export async function clioApiFetch(
  path: string,
  options: ClioApiFetchOptions = {},
): Promise<Response> {
  const accessToken = await getValidClioAccessToken();

  if (!accessToken) {
    throw new Error("Clio is not connected.");
  }

  const env = getAppEnv();
  const url = path.startsWith("http") ? path : `${env.clioBaseUrl}${path}`;
  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 401) {
    await deleteClioTokens();
  }

  return response;
}

export async function getCurrentClioUser(): Promise<ClioCurrentUser | null> {
  const response = await clioApiFetch("/users/who_am_i?fields=id,name");

  if (response.status === 401 || response.status === 403) {
    console.warn(
      `Clio current-user request was rejected with status ${response.status}: ${await response.text()}`,
    );
    await deleteClioTokens();
    return null;
  }

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

export async function getClioConnectionStatus(): Promise<ClioConnectionStatus> {
  try {
    const user = await getCurrentClioUser();

    if (!user) {
      return { connected: false };
    }

    return { connected: true, user };
  } catch {
    return {
      connected: false,
      reason: "Unable to verify the Clio connection right now.",
    };
  }
}

export async function disconnectClio(): Promise<void> {
  const tokens = await loadClioTokens();
  const env = getAppEnv();

  if (tokens) {
    try {
      await fetch(env.clioDeauthorizeUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ token: tokens.accessToken }),
        cache: "no-store",
      });
    } catch {
      // Local disconnect should still remove stored tokens if Clio is unreachable.
    }
  }

  await deleteClioTokens();
}
