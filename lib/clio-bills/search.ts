import { clioApiFetch } from "@/lib/clio";
import { BILL_LIST_FIELDS } from "@/lib/clio-bills/fields";
import { normalizeBill } from "@/lib/clio-bills/normalizers";
import { isSelectableBill } from "@/lib/clio-bills/state";
import type {
  BillListItem,
  ClioBillListResponse,
} from "@/lib/clio-bills/types";

const BILL_SEARCH_PAGE_LIMIT = "100";

function matchesQuery(bill: BillListItem, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [bill.number, bill.clientName, bill.state]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedQuery));
}

async function getPagedBills(path: string): Promise<BillListItem[]> {
  const bills: BillListItem[] = [];
  let nextPath: string | null = path;

  while (nextPath) {
    const response = await clioApiFetch(nextPath);

    if (!response.ok) {
      throw new Error(`Clio bill list request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as ClioBillListResponse;

    if (Array.isArray(payload.data)) {
      bills.push(
        ...payload.data
          .map(normalizeBill)
          .filter((bill) => bill !== null),
      );
    }

    nextPath = payload.meta?.paging?.next ?? null;
  }

  return bills;
}

export async function searchBills(query: string): Promise<BillListItem[]> {
  const params = new URLSearchParams({
    limit: BILL_SEARCH_PAGE_LIMIT,
    fields: BILL_LIST_FIELDS,
  });
  const bills = await getPagedBills(`/bills?${params.toString()}`);

  return bills.filter((bill) => isSelectableBill(bill) && matchesQuery(bill, query));
}
