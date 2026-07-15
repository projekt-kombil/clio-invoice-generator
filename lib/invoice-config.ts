export type InvoiceFirmConfig = {
  name: string;
  logoInitials: string;
  logoSrc: string | null;
  addressLines: string[];
  taxIdLabel: string;
  taxId: string;
  principalName: string;
  currencyCode: string;
  locale: string;
  bankAccounts: Array<{
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    bsbNumber: string;
    swiftCode: string;
  }>;
  footerLines: string[];
};

export const invoiceFirmConfig: InvoiceFirmConfig = {
  name: "Jema Lawyers",
  logoInitials: "IG",
  logoSrc: "/jema_lawyers.png",
  addressLines: [
    "Peter O'Connor Foundation Building, Kunai St, Waigani, NCD",
    "PO Box 332, Vision City 131, Papua New Guinea",
    "Port Moresby: +675 325 6400 | +675 303 0200",
    "Mt Hagen: +675 542 0301 | +675 542 0302",
  ],
  taxIdLabel: "IRC TIN",
  taxId: "500146692",
  principalName: "McRonald Nale",
  currencyCode: "PGK",
  locale: "en-PG",
  bankAccounts: [
    {
      bankName: "Kina Bank Limited",
      accountName: "Jema Lawyers",
      branch: "Boroko",
      bsbNumber: "028 - 027",
      swiftCode: "KINIPGPG",
      accountNumber: "15420655",
    },
    {
      bankName: "BSP Financial Group Limited",
      accountName: "Jema Lawyers",
      branch: "Waigani Drive",
      bsbNumber: "088 - 968",
      swiftCode: "BOSPPGPM",
      accountNumber: "7017288775",
    },
  ],
  footerLines: ["Thank you for choosing Jema Lawyers."],
};
