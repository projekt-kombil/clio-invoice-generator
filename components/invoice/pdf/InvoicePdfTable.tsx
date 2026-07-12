import { Text, View } from "@react-pdf/renderer";
import type {
  InvoiceDocumentData,
  InvoiceLineItem,
  InvoiceLineItemGroup,
} from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  formatInvoiceQuantity,
} from "@/lib/invoice-formatting";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";

const TABLE_CHUNK_SIZE = 14;

function chunkLineItems(items: InvoiceLineItem[]): InvoiceLineItem[][] {
  const chunks: InvoiceLineItem[][] = [];

  for (let index = 0; index < items.length; index += TABLE_CHUNK_SIZE) {
    chunks.push(items.slice(index, index + TABLE_CHUNK_SIZE));
  }

  return chunks;
}

export function shouldShowInvoiceLineGroup(group: InvoiceLineItemGroup): boolean {
  return group.items.length > 0;
}

export function InvoicePdfTable({
  group,
  invoice,
}: {
  group: InvoiceLineItemGroup;
  invoice: InvoiceDocumentData;
}) {
  if (!shouldShowInvoiceLineGroup(group)) {
    return null;
  }

  const chunks = chunkLineItems(group.items);

  return (
    <View style={styles.tableSection}>
      <Text style={styles.sectionLabel}>{group.label}</Text>
      {chunks.map((chunk, chunkIndex) => (
        <View key={`${group.label}-${chunkIndex}`} style={styles.table}>
          <View style={styles.tableHeader} wrap={false}>
            <Text style={[styles.cell, styles.typeCell]}>Type</Text>
            <Text style={[styles.cell, styles.dateCell]}>Date</Text>
            <Text style={[styles.cell, styles.descriptionCell]}>Description</Text>
            <Text style={[styles.cell, styles.attorneyCell]}>Attorney</Text>
            <Text style={[styles.cell, styles.qtyCell]}>Qty</Text>
            <Text style={[styles.cell, styles.rateCell]}>Rate</Text>
            <Text style={[styles.cell, styles.amountCell]}>Amount</Text>
          </View>
          {chunk.map((item) => (
            <View key={item.id} style={styles.tableRow} wrap={false}>
              <Text style={[styles.cell, styles.typeCell]}>{item.type ?? ""}</Text>
              <Text style={[styles.cell, styles.dateCell]}>
                {formatInvoiceDate(item.date)}
              </Text>
              <View style={[styles.cell, styles.descriptionCell]}>
                <Text>{item.description}</Text>
                {item.note ? <Text style={styles.lineType}>{item.note}</Text> : null}
              </View>
              <Text style={[styles.cell, styles.attorneyCell]}>
                {item.attorney ?? ""}
              </Text>
              <Text style={[styles.cell, styles.qtyCell]}>
                {formatInvoiceQuantity(item.quantity)}
              </Text>
              <Text style={[styles.cell, styles.rateCell]}>
                {formatInvoiceMoney(item.price, invoice)}
              </Text>
              <Text style={[styles.cell, styles.amountCell]}>
                {formatInvoiceMoney(item.total, invoice)}
              </Text>
            </View>
          ))}
          {chunkIndex === chunks.length - 1 ? (
            <View style={styles.subtotalRow} wrap={false}>
              <Text style={[styles.cell, styles.subtotalLabelCell]}>
                {group.label} Subtotal
              </Text>
              <Text style={[styles.cell, styles.amountCell]}>
                {formatInvoiceMoney(group.subtotal, invoice)}
              </Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
