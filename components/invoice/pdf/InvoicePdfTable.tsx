import { Text, View } from "@react-pdf/renderer";
import type {
  InvoiceDocumentData,
  InvoiceLineItem,
  InvoiceLineItemGroup,
} from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  formatInvoicePercent,
  formatInvoiceQuantity,
} from "@/lib/invoice-formatting";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";
import {
  getInvoiceLineItemNetTotal,
  getInvoiceLineItemTableGroups,
} from "@/components/invoice/line-item-table-groups";
import { sumInvoiceLineItemTax } from "@/components/invoice/tax-summary";

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
  showTax = false,
}: {
  group: InvoiceLineItemGroup;
  invoice: InvoiceDocumentData;
  showTax?: boolean;
}) {
  if (!shouldShowInvoiceLineGroup(group)) {
    return null;
  }

  const tableGroups = getInvoiceLineItemTableGroups(group, {
    excludeTax: showTax,
  });

  return (
    <>
      {tableGroups.map((tableGroup) => {
        const chunks = chunkLineItems(tableGroup.items);

        return (
          <View key={`${group.label}-${tableGroup.label}`} style={styles.tableSection}>
            <Text style={styles.tableTitle}>{tableGroup.label}</Text>
            {chunks.map((chunk, chunkIndex) => (
              <View key={`${tableGroup.label}-${chunkIndex}`} style={styles.table}>
                <View style={styles.tableHeader} wrap={false}>
                  <Text style={[styles.cell, styles.dateCell]}>Date</Text>
                  <Text style={[styles.cell, styles.descriptionCell]}>
                    Description
                  </Text>
                  <Text style={[styles.cell, styles.attorneyCell]}>Attorney</Text>
                  <Text style={[styles.cell, styles.qtyCell]}>Quantity</Text>
                  <Text style={[styles.cell, styles.rateCell]}>
                    {`Rate\u00A0(${invoice.firm.currencyCode})`}
                  </Text>
                  <Text style={[styles.cell, styles.amountCell]}>
                    {`Total\u00A0(${invoice.firm.currencyCode})`}
                  </Text>
                </View>
                {chunk.map((item, itemIndex) => (
                  <View
                    key={item.id}
                    style={
                      itemIndex % 2 === 1
                        ? [styles.tableRow, styles.tableRowAlt]
                        : styles.tableRow
                    }
                    wrap={false}
                  >
                    <Text style={[styles.cell, styles.dateCell]}>
                      {formatInvoiceDate(item.date)}
                    </Text>
                    <View style={[styles.cell, styles.descriptionCell]}>
                      <Text style={styles.lineDescription}>{item.description}</Text>
                      {item.note ? (
                        <Text style={styles.lineType}>{item.note}</Text>
                      ) : null}
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
                      {formatInvoiceMoney(
                        showTax ? getInvoiceLineItemNetTotal(item) : item.total,
                        invoice,
                      )}
                    </Text>
                  </View>
                ))}
                {chunkIndex === chunks.length - 1 ? (
                  <>
                    <View style={styles.subtotalRow} wrap={false}>
                      <View style={styles.lineItemSummaryPair}>
                        <Text style={[styles.cell, styles.lineItemSummaryLabel]}>
                          Subtotal
                        </Text>
                        <Text style={[styles.cell, styles.lineItemSummaryAmount]}>
                          {formatInvoiceMoney(tableGroup.subtotal, invoice)}
                        </Text>
                      </View>
                    </View>
                    {showTax ? (
                      <View style={styles.taxRow} wrap={false}>
                        <View style={styles.lineItemSummaryPair}>
                          <Text style={[styles.cell, styles.lineItemSummaryLabel]}>
                            GST
                            {invoice.taxRate !== null
                              ? ` (${formatInvoicePercent(invoice.taxRate)})`
                              : ""}
                          </Text>
                          <Text style={[styles.cell, styles.lineItemSummaryAmount]}>
                            {formatInvoiceMoney(
                              sumInvoiceLineItemTax(tableGroup.items),
                              invoice,
                            )}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}
