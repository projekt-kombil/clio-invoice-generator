import { clioApiFetch } from "@/lib/clio";
import {
  BILL_DETAIL_FIELDS,
  CONTACT_DETAIL_FIELDS,
  LINE_ITEM_FIELDS,
  MATTER_DETAIL_FIELDS,
  STATEMENT_BILL_FIELDS,
} from "@/lib/clio-bills/fields";
import {
  getObject,
  normalizeAddress,
  normalizeBillDetail,
  normalizeLineItem,
  normalizeMatter,
} from "@/lib/clio-bills/normalizers";
import type {
  BillAccountStatementEntry,
  BillDetail,
  BillDetailedStatementInvoice,
  BillLineItem,
  BillMatter,
  ClioAddress,
  ClioBillDetailResponse,
  ClioBillListResponse,
  ClioContactDetailResponse,
  ClioMatterDetailResponse,
  ClioUserSummary,
} from "@/lib/clio-bills/types";

type ClioListResponse = {
  data?: unknown[];
  meta?: {
    paging?: {
      next?: string;
    };
  };
};

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function normalizeDetailedStatementInvoice(
  value: unknown,
): BillDetailedStatementInvoice | null {
  const object = getObject(value);

  if (!object || typeof object.id !== "number") {
    return null;
  }

  return {
    id: object.id,
    number: getString(object.number) ?? String(object.id),
    dueAt: getString(object.due_at),
    total:
      typeof object.total === "string" || typeof object.total === "number"
        ? object.total
        : null,
    paid: getNumber(object.paid),
    balance:
      typeof object.balance === "string" || typeof object.balance === "number"
        ? object.balance
        : null,
  };
}

async function getPagedData(path: string): Promise<unknown[]> {
  const values: unknown[] = [];
  let nextPath: string | null = path;

  while (nextPath) {
    const response = await clioApiFetch(nextPath);

    if (response.status === 403 || response.status === 404) {
      return values;
    }

    if (!response.ok) {
      throw new Error(
        `Clio statement request failed with status ${response.status}.`,
      );
    }

    const payload = (await response.json()) as ClioListResponse;

    if (Array.isArray(payload.data)) {
      values.push(...payload.data);
    }

    nextPath = payload.meta?.paging?.next ?? null;
  }

  return values;
}

async function getDetailedStatementInvoices(
  bill: BillDetail,
): Promise<BillDetailedStatementInvoice[]> {
  const primaryMatterId = bill.matters[0]?.id ?? bill.lineItems[0]?.matter?.id ?? null;
  const params = new URLSearchParams({
    fields: STATEMENT_BILL_FIELDS,
    limit: "100",
  });

  if (primaryMatterId) {
    params.set("matter_id", String(primaryMatterId));
  } else if (bill.clientId) {
    params.set("client_id", String(bill.clientId));
  } else {
    return [
      {
        id: bill.id,
        number: bill.number,
        dueAt: bill.dueAt,
        total: bill.total,
        paid: bill.paid,
        balance: bill.balance,
      },
    ];
  }

  const values = await getPagedData(`/bills?${params.toString()}`);
  const invoices = values
    .map(normalizeDetailedStatementInvoice)
    .filter((invoice) => invoice !== null);

  return invoices.length > 0
    ? invoices
    : [
        {
          id: bill.id,
          number: bill.number,
          dueAt: bill.dueAt,
          total: bill.total,
          paid: bill.paid,
          balance: bill.balance,
        },
      ];
}

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

async function getImageDataUrl(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return url;
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());

  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

async function hydrateUserSignature(
  user: ClioUserSummary | null,
  cache: Map<string, Promise<string>>,
): Promise<ClioUserSummary | null> {
  if (!user?.signature || user.signature.startsWith("data:")) {
    return user;
  }

  let signature = cache.get(user.signature);

  if (!signature) {
    signature = getImageDataUrl(user.signature).catch(() => user.signature ?? "");
    cache.set(user.signature, signature);
  }

  return {
    ...user,
    signature: await signature,
  };
}

async function hydrateMatterSignatures(
  matter: BillMatter,
  cache: Map<string, Promise<string>>,
): Promise<BillMatter> {
  const [responsibleAttorney, originatingAttorney, user] = await Promise.all([
    hydrateUserSignature(matter.responsibleAttorney, cache),
    hydrateUserSignature(matter.originatingAttorney, cache),
    hydrateUserSignature(matter.user, cache),
  ]);

  return {
    ...matter,
    responsibleAttorney,
    originatingAttorney,
    user,
  };
}

async function hydrateBillSignatures(detail: BillDetail): Promise<BillDetail> {
  const cache = new Map<string, Promise<string>>();
  const matters = await Promise.all(
    detail.matters.map((matter) => hydrateMatterSignatures(matter, cache)),
  );
  const lineItems = await Promise.all(
    detail.lineItems.map(async (item) => ({
      ...item,
      user: await hydrateUserSignature(item.user, cache),
      matter: item.matter
        ? await hydrateMatterSignatures(item.matter, cache)
        : item.matter,
    })),
  );

  return {
    ...detail,
    matters,
    lineItems,
  };
}

function mergeBillDetailData(
  detail: BillDetail,
  matterDetails: Map<number, BillMatter>,
  clientAddresses: ClioAddress[],
  accountStatementEntries: BillAccountStatementEntry[],
  detailedStatementInvoices: BillDetailedStatementInvoice[],
): BillDetail {
  const merged = {
    ...detail,
    clientAddresses,
    accountStatementEntries,
    detailedStatementInvoices,
    matters: detail.matters.map((matter) => matterDetails.get(matter.id) ?? matter),
    lineItems: detail.lineItems.map((item) => ({
      ...item,
      matter: item.matter
        ? matterDetails.get(item.matter.id) ?? item.matter
        : item.matter,
    })),
  };

  return merged;
}

function getMatterIds(bill: BillDetail): number[] {
  return [
    ...bill.matters.map((matter) => matter.id),
    ...bill.lineItems
      .map((item) => item.matter?.id)
      .filter((matterId) => matterId !== undefined),
  ];
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
  const detailedStatementInvoices = await getDetailedStatementInvoices(billDetail);

  const mergedBill = mergeBillDetailData(
    billDetail,
    matterDetails,
    clientAddresses,
    [],
    detailedStatementInvoices,
  );

  return hydrateBillSignatures(mergedBill);
}
