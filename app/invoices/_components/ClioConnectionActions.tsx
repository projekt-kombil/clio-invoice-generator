"use client";

import { useState } from "react";

type ClioConnectionActionsProps = {
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

export function ClioConnectionActions({
  connectionStatus,
}: ClioConnectionActionsProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  function handleDisconnect() {
    setIsDisconnecting(true);
  }

  if (connectionStatus.connected) {
    return (
      <>
        <p className="text-sm text-slate-700">
          Connected as{" "}
          <span className="font-semibold text-[var(--jema-navy)]">
            {connectionStatus.user?.name ?? "Clio user"}
          </span>
        </p>
        <form
          action="/api/auth/clio/disconnect"
          method="post"
          onSubmit={handleDisconnect}
        >
          <button
            aria-label="Disconnect from Clio"
            className="disconnect-button inline-flex h-10 w-10 items-center justify-center rounded-full border text-[var(--jema-navy)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isDisconnecting}
            title="Disconnect"
            type="submit"
          >
            {isDisconnecting ? (
              <span aria-hidden="true" className="loading-spinner" />
            ) : (
              <PowerIcon />
            )}
          </button>
        </form>
      </>
    );
  }

  return (
    <a
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--jema-navy)] px-5 text-sm font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-[var(--jema-cranberry)] aria-disabled:pointer-events-none aria-disabled:opacity-70"
      href="/api/auth/clio"
      aria-disabled={isConnecting}
      onClick={() => setIsConnecting(true)}
    >
      {isConnecting ? <span aria-hidden="true" className="loading-spinner" /> : null}
      {isConnecting ? "Connecting" : "Connect to Clio"}
    </a>
  );
}
