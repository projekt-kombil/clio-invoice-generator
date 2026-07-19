import { disconnectClio } from "@/lib/clio";
import { getAppEnv } from "@/lib/env";
import { isSameOriginRequest } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  await disconnectClio();

  const url = new URL("/", getAppEnv().appOrigin);
  url.searchParams.set("connection", "disconnected");

  return NextResponse.redirect(url, 303);
}
