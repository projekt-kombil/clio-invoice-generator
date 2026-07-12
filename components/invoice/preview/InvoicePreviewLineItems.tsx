import type {
  InvoiceDocumentData,
  InvoiceLineItemGroup,
} from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
} from "@/lib/invoice-formatting";

export function InvoicePreviewItemsTable({
  group,
  invoice,
}: {
  group: InvoiceLineItemGroup;
  invoice: InvoiceDocumentData;
}) {
  if (group.items.length === 0) {
    return null;
  }

  return (
    <section className="invoice-section">
      <h2>{group.label}</h2>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Description</th>
            <th>Attorney</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {group.items.map((item) => (
            <tr key={item.id}>
              <td>{item.type ?? ""}</td>
              <td>{formatInvoiceDate(item.date)}</td>
              <td>
                <span className="line-description">{item.description}</span>
                {item.note ? <span className="line-note">{item.note}</span> : null}
              </td>
              <td>{item.attorney ?? ""}</td>
              <td>{item.quantity ?? ""}</td>
              <td>{formatInvoiceMoney(item.price, invoice)}</td>
              <td>{formatInvoiceMoney(item.total, invoice)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={6}>Subtotal</td>
            <td>{formatInvoiceMoney(group.subtotal, invoice)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
