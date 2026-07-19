import "server-only";

import {
  deleteClioTokensFromD1,
  getCloudflareD1,
  loadClioTokensFromD1,
  saveClioTokensToD1,
} from "@/lib/clio-token-store/d1";
import type {
  ClioTokensToStore,
  StoredClioTokens,
} from "@/lib/clio-token-store/types";

export type { StoredClioTokens } from "@/lib/clio-token-store/types";

export async function saveClioTokens(tokens: ClioTokensToStore): Promise<void> {
  await saveClioTokensToD1(await getCloudflareD1(), tokens);
}

export async function loadClioTokens(
  userId: string,
): Promise<StoredClioTokens | null> {
  return loadClioTokensFromD1(await getCloudflareD1(), userId);
}

export async function deleteClioTokens(userId: string): Promise<void> {
  await deleteClioTokensFromD1(await getCloudflareD1(), userId);
}
