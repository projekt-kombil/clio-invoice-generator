import { deleteClioTokens } from "@/lib/clio-token-store";
import { getValidClioAccessToken } from "@/lib/clio/oauth";
import type {
  ClioApiFetchOptions,
  ClioCurrentUser,
  ClioWhoAmIResponse,
} from "@/lib/clio/types";
import { getAppEnv } from "@/lib/env";

const CLIO_RATE_LIMIT_MAX_RETRIES = 2;
const CLIO_RATE_LIMIT_DEFAULT_RETRY_MS = 1_000;
const CLIO_RATE_LIMIT_MAX_RETRY_MS = 10_000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(response: Response): number {
  const retryAfter = response.headers.get("retry-after");

  if (!retryAfter) {
    return CLIO_RATE_LIMIT_DEFAULT_RETRY_MS;
  }

  const seconds = Number(retryAfter);
  const retryMs = Number.isFinite(seconds)
    ? seconds * 1_000
    : new Date(retryAfter).getTime() - Date.now();

  if (!Number.isFinite(retryMs) || retryMs <= 0) {
    return CLIO_RATE_LIMIT_DEFAULT_RETRY_MS;
  }

  return Math.min(retryMs, CLIO_RATE_LIMIT_MAX_RETRY_MS);
}

function isRetryableClioRequest(options: ClioApiFetchOptions): boolean {
  const method = options.method?.toUpperCase() ?? "GET";

  return method === "GET" || method === "HEAD";
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

  let response: Response;

  for (let attempt = 0; attempt <= CLIO_RATE_LIMIT_MAX_RETRIES; attempt += 1) {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (
      response.status !== 429 ||
      !isRetryableClioRequest(options) ||
      attempt === CLIO_RATE_LIMIT_MAX_RETRIES
    ) {
      break;
    }

    await delay(getRetryDelayMs(response));
  }

  if (response!.status === 401) {
    await deleteClioTokens();
  }

  return response!;
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
