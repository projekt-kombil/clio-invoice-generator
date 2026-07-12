export type InvoiceFirmConfig = {
  name: string;
  logoInitials: string;
  logoSrc: string | null;
  addressLines: string[];
  taxIdLabel: string;
  taxId: string;
  currencyCode: string;
  locale: string;
  bankAccountLines: string[];
  footerLines: string[];
};

export const invoiceFirmConfig: InvoiceFirmConfig = {
  name: "Invoice Generator",
  logoInitials: "IG",
  logoSrc: null,
  addressLines: ["Firm address pending"],
  taxIdLabel: "IRC TIN",
  taxId: "TIN pending",
  currencyCode: "PGK",
  locale: "en-PG",
  bankAccountLines: ["Firm bank account details pending"],
  footerLines: ["Thank you for your business."],
};
