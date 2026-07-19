import {
  getExpectedOAuthCodeVerifier,
  getExpectedOAuthState,
  redirectToGenerator,
} from "@/app/api/auth/clio/_lib/oauth-flow";
import { exchangeAuthorizationCode, getClioConnectionStatus } from "@/lib/clio";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const expectedState = getExpectedOAuthState(request);
  const codeVerifier = getExpectedOAuthCodeVerifier(request);
  const actualState = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    console.warn("Clio callback returned an authorization error.");
    return redirectToGenerator(request, {
      connection: "declined",
    });
  }

  if (!expectedState || !actualState || expectedState !== actualState) {
    console.warn("Clio callback state validation failed", {
      hasExpectedState: Boolean(expectedState),
      hasActualState: Boolean(actualState),
    });

    return redirectToGenerator(request, {
      connection: "invalid_state",
    });
  }

  if (!code) {
    console.warn("Clio callback was missing an authorization code.");
    return redirectToGenerator(request, {
      connection: "missing_code",
    });
  }

  if (!codeVerifier) {
    console.warn("Clio callback was missing the PKCE code verifier.");
    return redirectToGenerator(request, {
      connection: "missing_code_verifier",
    });
  }

  try {
    await exchangeAuthorizationCode(code, codeVerifier);

    const status = await getClioConnectionStatus();

    if (!status.connected) {
      console.warn("Clio OAuth callback completed, but current-user verification failed.");
      return redirectToGenerator(request, {
        connection: "verification_failed",
      });
    }
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `Clio OAuth callback failed: ${error.message}`
        : "Clio OAuth callback failed with an unknown error.",
    );

    return redirectToGenerator(request, {
      connection: "failed",
    });
  }

  return redirectToGenerator(request, {
    connection: "connected",
  });
}
