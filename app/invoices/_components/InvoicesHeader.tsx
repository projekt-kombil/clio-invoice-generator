type InvoicesHeaderProps = {
  connectionStatus: {
    connected: boolean;
    user?: {
      name: string;
    };
  };
};

function PowerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
    </svg>
  );
}

export function InvoicesHeader({ connectionStatus }: InvoicesHeaderProps) {
  return (
    <header className="app-topbar screen-only px-6 py-3 sm:px-8">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--jema-cranberry)]">
            Clio billing
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[var(--jema-navy)]">
            Invoice generator
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {connectionStatus.connected ? (
            <>
              <p className="text-sm text-slate-700">
                Connected as{" "}
                <span className="font-semibold text-[var(--jema-navy)]">
                  {connectionStatus.user?.name ?? "Clio user"}
                </span>
              </p>
              <form action="/api/auth/clio/disconnect" method="post">
                <button
                  aria-label="Disconnect from Clio"
                  className="disconnect-button inline-flex h-10 w-10 items-center justify-center rounded-full border text-[var(--jema-navy)]"
                  title="Disconnect"
                  type="submit"
                >
                  <PowerIcon />
                </button>
              </form>
            </>
          ) : (
            <a
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--jema-navy)] px-5 text-sm font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-[var(--jema-cranberry)]"
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
