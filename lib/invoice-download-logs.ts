import "server-only";

import { randomUUID } from "crypto";

import { getCloudflareD1 } from "@/lib/clio-token-store/d1";

const DEFAULT_USER_ID = "default";

type InvoiceDownloadLog = {
  clioBillId: string;
  clioMatterId: string | null;
  invoiceNumber: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export async function logInvoiceDownload({
  clioBillId,
  clioMatterId,
  invoiceNumber,
  ipAddress,
  userAgent,
}: InvoiceDownloadLog): Promise<void> {
  const db = await getCloudflareD1();

  await db
    .prepare(
      `
        INSERT INTO invoice_download_logs (
          id,
          user_id,
          clio_bill_id,
          clio_matter_id,
          invoice_number,
          downloaded_at,
          ip_address,
          user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      randomUUID(),
      DEFAULT_USER_ID,
      clioBillId,
      clioMatterId,
      invoiceNumber,
      Date.now(),
      ipAddress,
      userAgent,
    )
    .run();
}
