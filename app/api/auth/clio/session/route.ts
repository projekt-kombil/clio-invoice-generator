import { clearClioSessionCookie } from "@/lib/clio/session";
import { isSameOriginRequest } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  clearClioSessionCookie(response);

  return response;
}
