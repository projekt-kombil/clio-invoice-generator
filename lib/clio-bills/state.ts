import type { BillListItem } from "@/lib/clio-bills/types";

function normalizeBillState(state: string | null): string | null {
  return state?.trim().toLowerCase().replace(/[\s-]+/g, "_") ?? null;
}

export function isDeletedBillState(state: string | null): boolean {
  return normalizeBillState(state) === "deleted";
}

export function isSelectableBill(bill: Pick<BillListItem, "state">): boolean {
  return !isDeletedBillState(bill.state);
}
