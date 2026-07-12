import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Server-side PDF generation is disabled. Use the invoice page PDF buttons to generate the PDF in the browser.",
    },
    { status: 410 },
  );
}
