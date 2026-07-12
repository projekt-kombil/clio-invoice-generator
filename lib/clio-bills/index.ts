import "server-only";

export { getBillDetail } from "@/lib/clio-bills/detail";
export { searchBills } from "@/lib/clio-bills/search";
export type {
  BillDetail,
  BillLineItem,
  BillListItem,
  BillMatter,
  ClioAddress,
  ClioUserSummary,
} from "@/lib/clio-bills/types";
