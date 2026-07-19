import "server-only";

import { NextRequest } from "next/server";

import { getAppEnv } from "@/lib/env";

function getRequestOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");

  if (origin) {
    return origin;
  }

  const referer = request.headers.get("referer");

  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: NextRequest): boolean {
  return getRequestOrigin(request) === getAppEnv().appOrigin;
}
