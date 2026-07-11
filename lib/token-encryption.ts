import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

import { getAppEnv } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function getKey(): Buffer {
  return createHash("sha256")
    .update(getAppEnv().tokenEncryptionKey, "utf8")
    .digest();
}

export function encryptToken(value: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptToken(value: string): string {
  const [iv, authTag, encrypted] = value
    .split(".")
    .map((part) => Buffer.from(part, "base64url"));

  if (!iv || !authTag || !encrypted) {
    throw new Error("Stored token is not in the expected encrypted format.");
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
