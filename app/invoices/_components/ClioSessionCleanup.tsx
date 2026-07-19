"use client";

import { useEffect } from "react";

export function ClioSessionCleanup() {
  useEffect(() => {
    void fetch("/api/auth/clio/session", { method: "DELETE" }).catch(
      () => undefined,
    );
  }, []);

  return null;
}
