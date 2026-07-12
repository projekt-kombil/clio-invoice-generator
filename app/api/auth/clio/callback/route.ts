import { exchangeAuthorizationCode, getClioConnectionStatus } from "@/lib/clio";
import { NextRequest, NextResponse } from "next/server";

const STATE_COOKIE = "clio_oauth_state";

function redirectToInvoices(
  request: NextRequest,
  params: Record<string, string>,
): NextResponse {
  const url = new URL("/invoices", request.url);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const actualState = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return redirectToInvoices(request, {
      connection: "declined",
    });
  }

  if (!expectedState || !actualState || expectedState !== actualState) {
    return redirectToInvoices(request, {
      connection: "invalid_state",
    });
  }

  if (!code) {
    return redirectToInvoices(request, {
      connection: "missing_code",
    });
  }

  try {
    await exchangeAuthorizationCode(code);
    const status = await getClioConnectionStatus();

    if (!status.connected) {
      console.warn("Clio OAuth callback completed, but current-user verification failed.");
      return redirectToInvoices(request, {
        connection: "verification_failed",
      });
    }
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `Clio OAuth callback failed: ${error.message}`
        : "Clio OAuth callback failed with an unknown error.",
    );

    return redirectToInvoices(request, {
      connection: "failed",
    });
  }

  return redirectToInvoices(request, {
    connection: "connected",
  });
}
