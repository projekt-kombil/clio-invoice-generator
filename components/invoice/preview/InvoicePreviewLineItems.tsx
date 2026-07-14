import type {
  InvoiceDocumentData,
  InvoiceLineItemGroup,
} from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  formatInvoicePercent,
  formatInvoiceQuantity,
} from "@/lib/invoice-formatting";
import {
  getInvoiceLineItemNetTotal,
  getInvoiceLineItemTableGroups,
} from "@/components/invoice/line-item-table-groups";
import { sumInvoiceLineItemTax } from "@/components/invoice/tax-summary";

export function InvoicePreviewItemsTable({
  group,
  invoice,
  showTax = false,
}: {
  group: InvoiceLineItemGroup;
  invoice: InvoiceDocumentData;
  showTax?: boolean;
}) {
  if (group.items.length === 0) {
    return null;
  }

  const tableGroups = getInvoiceLineItemTableGroups(group, {
    excludeTax: showTax,
  });

  return tableGroups.map((tableGroup) => (
    <section className="invoice-section" key={`${group.label}-${tableGroup.label}`}>
      <h2 className="invoice-table-title">{tableGroup.label}</h2>
      <table className="invoice-table invoice-line-items">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Attorney</th>
            <th>Quantity</th>
            <th>Rate ({invoice.firm.currencyCode})</th>
            <th>Total ({invoice.firm.currencyCode})</th>
          </tr>
        </thead>
        <tbody>
          {tableGroup.items.map((item) => (
            <tr key={item.id}>
              <td>{formatInvoiceDate(item.date)}</td>
              <td>
                <span className="line-description">{item.description}</span>
                {item.note ? <span className="line-note">{item.note}</span> : null}
              </td>
              <td>{item.attorney ?? ""}</td>
              <td>{formatInvoiceQuantity(item.quantity)}</td>
              <td>{formatInvoiceMoney(item.price, invoice)}</td>
              <td>
                {formatInvoiceMoney(
                  showTax ? getInvoiceLineItemNetTotal(item) : item.total,
                  invoice,
                )}
              </td>
            </tr>
          ))}
          <tr className="invoice-subtotal-row">
            <td colSpan={6}>
              <div className="invoice-line-summary-pair">
                <span>Subtotal</span>
                <span>{formatInvoiceMoney(tableGroup.subtotal, invoice)}</span>
              </div>
            </td>
          </tr>
          {showTax ? (
            <tr className="invoice-tax-row">
              <td colSpan={6}>
                <div className="invoice-line-summary-pair">
                  <span>
                    GST
                    {invoice.taxRate !== null
                      ? ` (${formatInvoicePercent(invoice.taxRate)})`
                      : ""}
                  </span>
                  <span>
                    {formatInvoiceMoney(
                      sumInvoiceLineItemTax(tableGroup.items),
                      invoice,
                    )}
                  </span>
                </div>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  ));
}
