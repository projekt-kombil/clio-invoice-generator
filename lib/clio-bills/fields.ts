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
  "subject",
  "total",
  "balance",
  "tax_rate",
  "tax_sum",
  "paid",
  "discount",
  "interest",
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
  "tax",
  "user{id,name,initials,signature}",
  "matter{id,description,display_number,number}",
].join(",");

export const MATTER_DETAIL_FIELDS = [
  "id",
  "description",
  "display_number",
  "number",
  "responsible_attorney{id,name,initials,signature}",
  "originating_attorney{id,name,initials,signature}",
  "user{id,name,initials,signature}",
].join(",");

export const CONTACT_DETAIL_FIELDS = [
  "id",
  "name",
  "addresses{id,name,street,city,province,postal_code,country}",
  "primary_address{id,name,street,city,province,postal_code,country}",
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
