import { getCurrentClioSessionUserId } from "@/lib/clio/session";
import { logInvoiceDownload } from "@/lib/invoice-download-logs";
import { isSameOriginRequest } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type DownloadLogRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function getIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    request.headers.get("cf-connecting-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    null
  );
}

export async function POST(request: NextRequest, { params }: DownloadLogRouteProps) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { id } = await params;
  const userId = await getCurrentClioSessionUserId();
  const body = (await request.json().catch(() => null)) as {
    clioMatterId?: unknown;
    invoiceNumber?: unknown;
  } | null;
  const invoiceNumber =
    typeof body?.invoiceNumber === "string" ? body.invoiceNumber.trim() : "";
  const clioMatterId =
    typeof body?.clioMatterId === "string" && body.clioMatterId.trim()
      ? body.clioMatterId.trim()
      : null;

  if (!userId) {
    return NextResponse.json({ error: "Clio is not connected." }, { status: 401 });
  }

  if (!id || !invoiceNumber) {
    return NextResponse.json({ error: "Missing download log data." }, { status: 400 });
  }

  await logInvoiceDownload({
    userId,
    clioBillId: id,
    clioMatterId,
    invoiceNumber,
    ipAddress: getIpAddress(request),
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
