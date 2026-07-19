import { getCurrentClioUser } from "@/lib/clio/api";
import type { ClioConnectionStatus } from "@/lib/clio/types";
import { deleteClioTokens, loadClioTokens } from "@/lib/clio-token-store";
import { getCurrentClioSessionUserId } from "@/lib/clio/session";
import { getAppEnv } from "@/lib/env";

export async function getClioConnectionStatus(): Promise<ClioConnectionStatus> {
  const sessionUserId = await getCurrentClioSessionUserId();

  try {
    const user = await getCurrentClioUser();

    if (!user) {
      return { connected: false, hasSession: Boolean(sessionUserId) };
    }

    return { connected: true, user };
  } catch {
    return {
      connected: false,
      hasSession: Boolean(sessionUserId),
      reason: "Unable to verify the Clio connection right now.",
    };
  }
}

export async function disconnectClio(): Promise<void> {
  const userId = await getCurrentClioSessionUserId();

  if (!userId) {
    return;
  }

  const tokens = await loadClioTokens(userId);
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

  await deleteClioTokens(userId);
}
