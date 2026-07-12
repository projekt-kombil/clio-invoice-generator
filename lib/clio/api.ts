import { deleteClioTokens } from "@/lib/clio-token-store";
import { getValidClioAccessToken } from "@/lib/clio/oauth";
import type {
  ClioApiFetchOptions,
  ClioCurrentUser,
  ClioWhoAmIResponse,
} from "@/lib/clio/types";
import { getAppEnv } from "@/lib/env";

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
