import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  formatInvoicePercent,
  formatInvoiceQuantity,
} from "@/lib/invoice-formatting";
import { getInvoiceAccountStatementRows } from "@/components/invoice/account-statement";
import { getInvoiceAttorneySummary } from "@/components/invoice/attorney-summary";
import { imageSource } from "@/components/invoice/image-source";
import { getInvoiceOverallTotalSummary } from "@/components/invoice/overall-total";

type InvoicePreviewSectionProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePreviewAttorneys({ invoice }: InvoicePreviewSectionProps) {
  const attorneySummary = getInvoiceAttorneySummary(invoice);

  return (
    <section className="invoice-section">
      <h2 className="invoice-table-title">Attorney Summary</h2>
      {attorneySummary.length > 0 ? (
        <table className="invoice-table invoice-attorney-summary-table">
          <thead>
            <tr>
              <th>Attorney</th>
              <th>Entries</th>
              <th>Quantity</th>
              <th>Total ({invoice.firm.currencyCode})</th>
            </tr>
          </thead>
          <tbody>
            {attorneySummary.map((attorney) => (
              <tr key={attorney.name}>
                <td>{attorney.name}</td>
                <td>{attorney.entries}</td>
                <td>{formatInvoiceQuantity(attorney.quantity)}</td>
                <td>{formatInvoiceMoney(attorney.total, invoice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : invoice.attorneys.length > 0 ? (
        <table className="invoice-table invoice-attorney-table">
          <tbody>
            {invoice.attorneys.map((attorney) => (
              <tr key={attorney.name}>
                <td>{attorney.name}</td>
                <td>{attorney.role ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}

export function InvoicePreviewOverallTotal({
  invoice,
}: InvoicePreviewSectionProps) {
  const totalSummary = getInvoiceOverallTotalSummary(invoice);

  return (
    <section className="invoice-section invoice-overall-total">
      <h2 className="invoice-table-title">Invoice Total</h2>
      <table className="invoice-table invoice-overall-total-table">
        <tbody>
          <tr>
            <td>Subtotal ({invoice.firm.currencyCode})</td>
            <td>{formatInvoiceMoney(totalSummary.subtotal, invoice)}</td>
          </tr>
          <tr>
            <td>
              Tax
              {invoice.taxRate !== null
                ? ` (${formatInvoicePercent(invoice.taxRate)})`
                : ""}{" "}
              ({invoice.firm.currencyCode})
            </td>
            <td>{formatInvoiceMoney(totalSummary.tax, invoice)}</td>
          </tr>
          <tr>
            <td>Total ({invoice.firm.currencyCode})</td>
            <td>{formatInvoiceMoney(totalSummary.total, invoice)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export function InvoicePreviewSignature({ invoice }: InvoicePreviewSectionProps) {
  const signatureImageSrc = imageSource(invoice.responsibleAttorneySignatureImage);

  return (
    <section className="invoice-section invoice-signature-section">
      <h2 className="invoice-signature-heading">
        Lawyer Responsible E-Signature
      </h2>
      <div className="invoice-signature-box">
        {signatureImageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Responsible attorney signature"
            src={signatureImageSrc}
          />
        ) : null}
        {invoice.responsibleAttorneySignature ? (
          <p>{invoice.responsibleAttorneySignature}</p>
        ) : null}
      </div>
      <InvoicePreviewPaymentDetails invoice={invoice} />
    </section>
  );
}

function InvoicePreviewPaymentDetails({ invoice }: InvoicePreviewSectionProps) {
  return (
    <section className="payment-details">
      <p className="payment-instruction">
        Please pay within 14 days by direct deposit in Jema Lawyers Bank Account
        as detailed:
      </p>
      <div className="payment-bank-grid">
        {invoice.firm.bankAccounts.map((account) => (
          <div className="payment-bank-column" key={account.accountNumber}>
            <h2>{account.bankName}</h2>
            <dl>
              <div>
                <dt>Account Name</dt>
                <dd>{account.accountName}</dd>
              </div>
              <div>
                <dt>Branch</dt>
                <dd>{account.branch}</dd>
              </div>
              <div>
                <dt>BSB No</dt>
                <dd>{account.bsbNumber}</dd>
              </div>
              <div>
                <dt>Account Number</dt>
                <dd>{account.accountNumber}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function InvoicePreviewTotals({ invoice }: InvoicePreviewSectionProps) {
  const statementRows = getInvoiceAccountStatementRows(invoice);

  return (
    <section className="invoice-account-statement">
      <h2 className="invoice-table-title">Detailed Statement of Accounts</h2>
      <table className="invoice-table invoice-account-statement-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Due On</th>
            <th>Amount Due ({invoice.firm.currencyCode})</th>
            <th>Payments Received ({invoice.firm.currencyCode})</th>
            <th>Balance Due ({invoice.firm.currencyCode})</th>
          </tr>
        </thead>
        <tbody>
          {statementRows.map((row) =>
            row.kind === "section" ? (
              <tr className="statement-section-row" key={row.id}>
                <td colSpan={5}>{row.label}</td>
              </tr>
            ) : row.kind === "outstanding" || row.kind === "total" ? (
              <tr className={`statement-${row.kind}-row`} key={row.id}>
                <td colSpan={4}>{row.label}</td>
                <td>{row.value}</td>
              </tr>
            ) : (
              <tr className="statement-invoice-row" key={row.id}>
                <td>{row.invoiceNumber}</td>
                <td>{formatInvoiceDate(row.dueAt ?? null)}</td>
                <td>{row.amountDue}</td>
                <td>{row.paymentsReceived}</td>
                <td>{row.balanceDue}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </section>
  );
}

export function InvoicePreviewBottom({ invoice }: InvoicePreviewSectionProps) {
  return (
    <div className="invoice-bottom-grid">
      <InvoicePreviewTotals invoice={invoice} />
    </div>
  );
}

export function InvoicePreviewFooter({ invoice }: InvoicePreviewSectionProps) {
  return (
    <footer className="invoice-footer">
      {invoice.firm.footerLines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </footer>
  );
}
