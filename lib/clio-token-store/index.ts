import "server-only";

import {
  deleteClioTokensFromD1,
  getCloudflareD1,
  loadClioTokensFromD1,
  saveClioTokensToD1,
} from "@/lib/clio-token-store/d1";
import {
  deleteClioTokensLocally,
  loadClioTokensLocally,
  saveClioTokensLocally,
} from "@/lib/clio-token-store/local";
import type {
  ClioTokensToStore,
  StoredClioTokens,
} from "@/lib/clio-token-store/types";

export type { StoredClioTokens } from "@/lib/clio-token-store/types";

export async function saveClioTokens(tokens: ClioTokensToStore): Promise<void> {
  const d1 = await getCloudflareD1();

  if (d1) {
    await saveClioTokensToD1(d1, tokens);
    return;
  }

  await saveClioTokensLocally(tokens);
}

export async function loadClioTokens(): Promise<StoredClioTokens | null> {
  const d1 = await getCloudflareD1();

  if (d1) {
    return loadClioTokensFromD1(d1);
  }

  return loadClioTokensLocally();
}

export async function deleteClioTokens(): Promise<void> {
  const d1 = await getCloudflareD1();

  if (d1) {
    await deleteClioTokensFromD1(d1);
    return;
  }

  await deleteClioTokensLocally();
}
