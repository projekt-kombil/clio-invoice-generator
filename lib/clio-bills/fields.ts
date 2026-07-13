export const BILL_LIST_FIELDS = [
  "id",
  "number",
  "issued_at",
  "due_at",
  "state",
  "total",
  "balance",
  "client{id,name}",
].join(",");

export const BILL_DETAIL_FIELDS = [
  "id",
  "number",
  "issued_at",
  "due_at",
  "state",
  "kind",
  "subject",
  "purchase_order",
  "total",
  "balance",
  "tax_rate",
  "tax_sum",
  "paid",
  "paid_at",
  "discount",
  "interest",
  "currency",
  "client{id,name}",
  "matters{id,description,display_number,number}",
].join(",");

export const LINE_ITEM_FIELDS = [
  "id",
  "date",
  "kind",
  "note",
  "description",
  "quantity",
  "price",
  "total",
  "discount",
  "tax",
  "user{id,name,initials,signature,avatar,email}",
  "matter{id,description,display_number,number}",
].join(",");

export const MATTER_DETAIL_FIELDS = [
  "id",
  "description",
  "display_number",
  "number",
  "responsible_attorney{id,name,initials,signature,avatar,email}",
  "originating_attorney{id,name,initials,signature,avatar,email}",
  "user{id,name,initials,signature,avatar,email}",
].join(",");

export const CONTACT_DETAIL_FIELDS = [
  "id",
  "name",
  "addresses{id,name,street,city,province,postal_code,country}",
  "primary_address{id,name,street,city,province,postal_code,country}",
].join(",");

export const PAYMENT_FIELDS = [
  "id",
  "date",
  "amount",
  "description",
  "reference",
  "created_at",
  "updated_at",
].join(",");

export const ALLOCATION_FIELDS = [
  "id",
  "date",
  "amount",
  "description",
  "interest",
  "voided_at",
  "created_at",
  "updated_at",
  "bill{id,number}",
].join(",");

export const CREDIT_MEMO_FIELDS = [
  "id",
  "date",
  "amount",
  "description",
  "created_at",
  "updated_at",
].join(",");

export const BANK_TRANSACTION_FIELDS = [
  "id",
  "date",
  "amount",
  "description",
  "transaction_type",
  "source",
  "bill{id,number}",
  "created_at",
  "updated_at",
].join(",");

export const STATEMENT_BILL_FIELDS = [
  "id",
  "number",
  "due_at",
  "total",
  "paid",
  "balance",
  "state",
  "client{id,name}",
  "matters{id,display_number,description}",
].join(",");
