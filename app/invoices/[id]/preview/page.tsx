import { redirect } from "next/navigation";

type InvoicePreviewRedirectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InvoicePreviewRedirectPage({
  params,
}: InvoicePreviewRedirectPageProps) {
  const { id } = await params;

  redirect(`/?bill=${encodeURIComponent(id)}`);
}
