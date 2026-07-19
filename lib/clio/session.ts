import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import { getAppEnv } from "@/lib/env";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "clio_invoice_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string): string {
  return createHmac("sha256", getAppEnv().tokenEncryptionKey)
    .update(value)
    .digest("base64url");
}

function serializeSession(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

function parseSession(value: string | undefined): string | null {
  const [userId, signature] = value?.split(".") ?? [];

  if (!userId || !signature) {
    return null;
  }

  const expected = sign(userId);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer) ? userId : null;
}

export async function getCurrentClioSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();

  return parseSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export function setClioSessionCookie(
  response: NextResponse,
  userId: string,
): void {
  const isSecureAppOrigin = new URL(getAppEnv().appOrigin).protocol === "https:";

  response.cookies.set({
    name: SESSION_COOKIE,
    value: serializeSession(userId),
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureAppOrigin,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearClioSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE);
}
