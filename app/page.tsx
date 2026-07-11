import { getClioConnectionStatus } from "@/lib/clio";
import { getAppEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function getConnectionMessage(
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

type HomeProps = {
  searchParams: Promise<{
    connection?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const [{ connection }, status] = await Promise.all([
    searchParams,
    getClioConnectionStatus(),
  ]);
  const connectionMessage = getConnectionMessage(connection, status.connected);
  const appOrigin = getAppEnv().appOrigin;
  const connectUrl = `${appOrigin}/api/auth/clio`;
  const invoicesUrl = `${appOrigin}/invoices`;

  return (
    <main className="flex min-h-dvh flex-col bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10 sm:px-10">
        <header className="mb-10 border-b border-slate-300 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Local private app
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            Clio Invoice Generator
          </h1>
        </header>

        <section className="max-w-2xl rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Connection status
              </h2>
              {status.connected ? (
                <p className="mt-2 text-slate-700">
                  Connected as{" "}
                  <span className="font-semibold text-slate-950">
                    {status.user.name}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-slate-700">
                  Not connected to Clio.
                </p>
              )}
            </div>

            {connectionMessage ? (
              <p className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {connectionMessage}
              </p>
            ) : null}

            {!status.connected && status.reason ? (
              <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {status.reason}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              {status.connected ? (
                <>
                  <a
                    className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    href={invoicesUrl}
                  >
                    View invoices
                  </a>
                  <form action="/api/auth/clio/disconnect" method="post">
                    <button
                      className="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
                      type="submit"
                    >
                      Disconnect
                    </button>
                  </form>
                </>
              ) : (
                <a
                  className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  href={connectUrl}
                >
                  Connect to Clio
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
