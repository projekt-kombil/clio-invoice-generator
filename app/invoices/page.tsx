import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type LegacyInvoicesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyInvoicesPage({
  searchParams,
}: LegacyInvoicesPageProps) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();

  redirect(queryString ? `/?${queryString}` : "/");
}
