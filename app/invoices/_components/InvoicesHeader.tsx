type InvoicesHeaderProps = {
  connectionStatus: {
    connected: boolean;
    user?: {
      name: string;
    };
  };
};

export function InvoicesHeader({ connectionStatus }: InvoicesHeaderProps) {
  return (
    <header className="screen-only border-b border-slate-300 bg-white px-6 py-5 sm:px-8">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Clio billing
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            Invoice generator
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {connectionStatus.connected ? (
            <>
              <p className="text-sm text-slate-700">
                Connected as{" "}
                <span className="font-semibold text-slate-950">
                  {connectionStatus.user?.name ?? "Clio user"}
                </span>
              </p>
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
              href="/api/auth/clio"
            >
              Connect to Clio
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
