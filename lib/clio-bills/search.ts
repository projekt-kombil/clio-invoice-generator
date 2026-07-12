import { clioApiFetch } from "@/lib/clio";
import { BILL_LIST_FIELDS } from "@/lib/clio-bills/fields";
import { normalizeBill } from "@/lib/clio-bills/normalizers";
import type {
  BillListItem,
  ClioBillListResponse,
} from "@/lib/clio-bills/types";

function matchesQuery(bill: BillListItem, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [bill.number, bill.clientName, bill.state]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedQuery));
}

export async function searchBills(query: string): Promise<BillListItem[]> {
  const params = new URLSearchParams({
    limit: "50",
    fields: BILL_LIST_FIELDS,
  });
  const response = await clioApiFetch(`/bills?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Clio bill list request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ClioBillListResponse;
  const bills = Array.isArray(payload.data)
    ? payload.data.map(normalizeBill).filter((bill) => bill !== null)
    : [];

  return bills.filter((bill) => matchesQuery(bill, query));
}
