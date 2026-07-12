import { disconnectClio } from "@/lib/clio";
import { getAppEnv } from "@/lib/env";
import { NextResponse } from "next/server";

export async function POST() {
  await disconnectClio();

  const url = new URL("/invoices", getAppEnv().appOrigin);
  url.searchParams.set("connection", "disconnected");

  return NextResponse.redirect(url, 303);
}
