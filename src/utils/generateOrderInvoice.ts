import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  COLORS,
  drawHeader,
  drawSectionHeader,
  drawFooter,
  drawStatusBadge,
  formatPKR,
  formatDate,
  setHeading,
  setBody,
  setBold,
} from "./pdfTheme";

interface InvoiceItem {
  title: string;
  variant?: string;
  quantity: number;
  price_pkr: number;
  image_url?: string;
  seller_name?: string;
  seller_phone?: string;
  sku?: string;
  product_id?: string;
}

interface InvoiceOrder {
  id: string;
  order_number: string | null;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: string;
  payment_method: string;
  total_amount_pkr: number;
  order_status: string;
  items: InvoiceItem[];
  created_at: string;
  discount_amount?: number;
  shipping_charges?: number;
  tracking_id?: string | null;
  courier_name?: string | null;
  seller_store_name?: string;
  seller_contact?: string;
  seller_address?: string;
  pickup_location?: string;
}

export const generateOrderInvoice = (order: InvoiceOrder): void => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ref = order.order_number || order.id.slice(0, 8).toUpperCase();

  // ===== HEADER =====
  let y = drawHeader(doc, pw, "TAX INVOICE");

  // ===== ORDER META BAR =====
  doc.setFillColor(...COLORS.grayLight);
  doc.roundedRect(15, y, pw - 30, 18, 2, 2, "F");

  doc.setTextColor(...COLORS.grayDark);
  setBold(doc, 11);
  doc.text(`Invoice #${ref}`, 20, y + 7);

  setBody(doc, 9);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Date: ${formatDate(order.created_at)}`, 20, y + 13);

  // Status badge
  drawStatusBadge(doc, pw - 55, y + 4, order.order_status, 35, 10);

  y += 26;

  // ===== SELLER & BUYER CARDS =====
  const colW = (pw - 40) / 2;

  // Seller card
  doc.setFillColor(...COLORS.accentLight);
  doc.roundedRect(15, y, colW, 42, 2, 2, "F");
  y = drawSellerCard(doc, 15, y, colW, order);

  // Buyer card
  const buyerY = y - 42;
  doc.setFillColor(...COLORS.grayLight);
  doc.roundedRect(25 + colW, buyerY, colW, 42, 2, 2, "F");
  drawBuyerCard(doc, 25 + colW, buyerY, colW, order);

  y += 6;

  // ===== TRACKING BAR =====
  if (order.tracking_id && order.courier_name) {
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(15, y, pw - 30, 14, 2, 2, "F");
    doc.setTextColor(...COLORS.green);
    setBold(doc, 8);
    doc.text(`📦 ${order.courier_name}`, 20, y + 6);
    doc.text(`Tracking: ${order.tracking_id}`, 20, y + 11);
    y += 20;
  }

  // ===== PRODUCTS TABLE =====
  y = drawSectionHeader(doc, y, "Order Items", pw);

  const tableData = order.items.map((item, i) => [
    (i + 1).toString(),
    item.title + (item.variant ? ` (${item.variant})` : ""),
    item.sku || `SKU-${(item.product_id || "").slice(0, 6).toUpperCase()}`,
    formatPKR(item.price_pkr),
    item.quantity.toString(),
    formatPKR(item.price_pkr * item.quantity),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Product", "SKU", "Unit Price", "Qty", "Subtotal"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 58 },
      2: { cellWidth: 28, halign: "center", fontSize: 7 },
      3: { halign: "right", cellWidth: 26 },
      4: { halign: "center", cellWidth: 14 },
      5: { halign: "right", cellWidth: 28, fontStyle: "bold" },
    },
    styles: { fontSize: 8, cellPadding: 4, lineColor: COLORS.grayMid, lineWidth: 0.2 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 15, right: 15 },
  });

  let fY = (doc as any).lastAutoTable.finalY + 10;

  // ===== SUMMARY =====
  const summaryX = pw - 90;
  const subtotal = order.items.reduce((s, i) => s + i.price_pkr * i.quantity, 0);
  const shipping = order.shipping_charges ?? 150;

  doc.setFillColor(...COLORS.grayLight);
  doc.roundedRect(summaryX, fY, 75, order.discount_amount ? 58 : 48, 2, 2, "F");

  doc.setTextColor(...COLORS.gray);
  setBody(doc, 9);
  const lineH = 10;
  let sY = fY + 8;

  doc.text("Subtotal", summaryX + 5, sY);
  doc.text(formatPKR(subtotal), pw - 18, sY, { align: "right" });
  sY += lineH;

  doc.text("Shipping", summaryX + 5, sY);
  doc.text(formatPKR(shipping), pw - 18, sY, { align: "right" });
  sY += lineH;

  if (order.discount_amount && order.discount_amount > 0) {
    doc.setTextColor(...COLORS.green);
    doc.text("Discount", summaryX + 5, sY);
    doc.text(`-${formatPKR(order.discount_amount)}`, pw - 18, sY, { align: "right" });
    sY += lineH;
  }

  // Divider
  doc.setDrawColor(...COLORS.grayMid);
  doc.setLineWidth(0.3);
  doc.line(summaryX + 3, sY - 3, pw - 18, sY - 3);

  // Total
  doc.setTextColor(...COLORS.primary);
  setHeading(doc, 13);
  doc.text("TOTAL", summaryX + 5, sY + 5);
  doc.setTextColor(...COLORS.accent);
  doc.text(formatPKR(order.total_amount_pkr), pw - 18, sY + 5, { align: "right" });

  // Payment method (left side)
  doc.setTextColor(...COLORS.gray);
  setBody(doc, 8);
  doc.text(`Payment: ${order.payment_method}`, 15, fY + 8);

  // ===== FOOTER =====
  drawFooter(doc, pw, ph);

  doc.save(`FANZOON_Invoice_${ref}.pdf`);
};

function drawSellerCard(doc: jsPDF, x: number, y: number, w: number, order: InvoiceOrder): number {
  const px = x + 5;
  let cy = y + 6;

  doc.setTextColor(...COLORS.accent);
  setBold(doc, 8);
  doc.text("FROM", px, cy);
  cy += 5;

  const name = order.seller_store_name || order.items[0]?.seller_name || "FANZOON Seller";
  doc.setTextColor(...COLORS.black);
  setBold(doc, 10);
  doc.text(name, px, cy);
  cy += 5;

  setBody(doc, 8);
  doc.setTextColor(...COLORS.grayDark);
  const contact = order.seller_contact || order.items[0]?.seller_phone || "";
  if (contact) { doc.text(contact, px, cy); cy += 4; }
  const loc = order.seller_address || order.pickup_location || "";
  if (loc) {
    const lines = doc.splitTextToSize(loc, w - 10);
    doc.text(lines.slice(0, 2), px, cy);
    cy += (lines.slice(0, 2) as string[]).length * 3.5;
  }

  return y + 42;
}

function drawBuyerCard(doc: jsPDF, x: number, y: number, w: number, order: InvoiceOrder) {
  const px = x + 5;
  let cy = y + 6;

  doc.setTextColor(...COLORS.accent);
  setBold(doc, 8);
  doc.text("TO", px, cy);
  cy += 5;

  doc.setTextColor(...COLORS.black);
  setBold(doc, 10);
  doc.text(order.customer_name, px, cy);
  cy += 5;

  setBody(doc, 8);
  doc.setTextColor(...COLORS.grayDark);
  if (order.customer_phone) { doc.text(order.customer_phone, px, cy); cy += 4; }
  const lines = doc.splitTextToSize(order.shipping_address, w - 10);
  doc.text(lines.slice(0, 3), px, cy);
}
