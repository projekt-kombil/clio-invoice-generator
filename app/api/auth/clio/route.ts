import { createClioAuthorizeResponse } from "@/app/api/auth/clio/_lib/oauth-flow";

export async function GET() {
  return createClioAuthorizeResponse();
}
