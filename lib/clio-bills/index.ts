import "server-only";

import { clioApiFetch } from "@/lib/clio";
import {
  BILL_DETAIL_FIELDS,
  BILL_LIST_FIELDS,
  CONTACT_DETAIL_FIELDS,
  LINE_ITEM_FIELDS,
  MATTER_DETAIL_FIELDS,
} from "@/lib/clio-bills/fields";
import {
  getObject,
  normalizeAddress,
  normalizeBill,
  normalizeBillDetail,
  normalizeLineItem,
  normalizeMatter,
} from "@/lib/clio-bills/normalizers";
import type {
  BillDetail,
  BillLineItem,
  BillListItem,
  BillMatter,
  ClioAddress,
  ClioBillDetailResponse,
  ClioBillListResponse,
  ClioContactDetailResponse,
  ClioMatterDetailResponse,
} from "@/lib/clio-bills/types";

export type {
  BillDetail,
  BillLineItem,
  BillListItem,
  BillMatter,
  ClioAddress,
  ClioUserSummary,
} from "@/lib/clio-bills/types";

async function getContactAddresses(id: number): Promise<ClioAddress[]> {
  const response = await clioApiFetch(
    `/contacts/${encodeURIComponent(String(id))}?fields=${encodeURIComponent(CONTACT_DETAIL_FIELDS)}`,
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Clio contact detail request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ClioContactDetailResponse;
  const contact = getObject(payload.data);

  if (!contact) {
    return [];
  }

  const primaryAddress = normalizeAddress(contact.primary_address);
  const addresses = Array.isArray(contact.addresses)
    ? contact.addresses.map(normalizeAddress).filter((address) => address !== null)
    : [];

  return primaryAddress
    ? [primaryAddress, ...addresses.filter((address) => address.id !== primaryAddress.id)]
    : addresses;
}

async function getMatterDetail(id: number): Promise<BillMatter | null> {
  const response = await clioApiFetch(
    `/matters/${encodeURIComponent(String(id))}?fields=${encodeURIComponent(MATTER_DETAIL_FIELDS)}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Clio matter detail request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ClioMatterDetailResponse;

  return normalizeMatter(payload.data);
}

async function getMatterDetails(matterIds: number[]): Promise<Map<number, BillMatter>> {
  const uniqueMatterIds = [...new Set(matterIds)];
  const details = await Promise.all(uniqueMatterIds.map(getMatterDetail));

  return new Map(
    details
      .filter((matter) => matter !== null)
      .map((matter) => [matter.id, matter]),
  );
}

function mergeBillDetailData(
  detail: BillDetail,
  matterDetails: Map<number, BillMatter>,
  clientAddresses: ClioAddress[],
): BillDetail {
  return {
    ...detail,
    clientAddresses,
    matters: detail.matters.map((matter) => matterDetails.get(matter.id) ?? matter),
    lineItems: detail.lineItems.map((item) => ({
      ...item,
      matter: item.matter
        ? matterDetails.get(item.matter.id) ?? item.matter
        : item.matter,
    })),
  };
}

function matchesQuery(bill: BillListItem, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [bill.number, bill.clientName, bill.state]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedQuery));
}

function getMatterIds(bill: BillDetail): number[] {
  return [
    ...bill.matters.map((matter) => matter.id),
    ...bill.lineItems
      .map((item) => item.matter?.id)
      .filter((matterId) => matterId !== undefined),
  ];
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

export async function getBillDetail(id: string): Promise<BillDetail | null> {
  const billResponse = await clioApiFetch(
    `/bills/${encodeURIComponent(id)}?fields=${encodeURIComponent(BILL_DETAIL_FIELDS)}`,
  );

  if (billResponse.status === 404) {
    return null;
  }

  if (!billResponse.ok) {
    throw new Error(`Clio bill detail request failed with status ${billResponse.status}.`);
  }

  const lineItemParams = new URLSearchParams({
    bill_id: id,
    limit: "100",
    fields: LINE_ITEM_FIELDS,
  });
  const lineItemResponse = await clioApiFetch(`/line_items?${lineItemParams.toString()}`);

  if (!lineItemResponse.ok) {
    throw new Error(
      `Clio line item request failed with status ${lineItemResponse.status}.`,
    );
  }

  const billPayload = (await billResponse.json()) as ClioBillDetailResponse;
  const lineItemPayload = (await lineItemResponse.json()) as ClioBillListResponse;
  const lineItems: BillLineItem[] = Array.isArray(lineItemPayload.data)
    ? lineItemPayload.data
        .map(normalizeLineItem)
        .filter((lineItem) => lineItem !== null)
    : [];

  const billDetail = normalizeBillDetail(billPayload.data, lineItems);

  if (!billDetail) {
    return null;
  }

  const [matterDetails, clientAddresses] = await Promise.all([
    getMatterDetails(getMatterIds(billDetail)),
    billDetail.clientId ? getContactAddresses(billDetail.clientId) : [],
  ]);

  return mergeBillDetailData(billDetail, matterDetails, clientAddresses);
}
