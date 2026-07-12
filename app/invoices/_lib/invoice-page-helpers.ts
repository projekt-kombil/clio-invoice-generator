export function getConnectionMessage(
  connection: string | undefined,
  isConnected: boolean,
): string | null {
  switch (connection) {
    case "connected":
      return isConnected
        ? "Connected to Clio successfully."
        : "Clio returned from authorization, but the local app could not verify the connection. Please connect again.";
    case "disconnected":
      return "Disconnected from Clio.";
    case "declined":
      return "Clio access was declined.";
    case "invalid_state":
      return "Connection could not be completed because the OAuth state check failed.";
    case "missing_code":
      return "Connection could not be completed because Clio did not return an authorization code.";
    case "failed":
      return "Connection could not be completed. Check the app credentials and redirect URI.";
    case "verification_failed":
      return "Clio approved the app, but the local app could not verify API access. Check the selected Clio permissions and region.";
    default:
      return null;
  }
}

export function getBillSelectionHref(query: string, billId: number): string {
  const params = new URLSearchParams({ bill: String(billId) });

  if (query) {
    params.set("q", query);
  }

  return `/invoices?${params.toString()}`;
}
