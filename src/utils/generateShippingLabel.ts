import jsPDF from "jspdf";
import QRCode from "qrcode";
import { COLORS, setBold, setBody, trunc, formatPKR } from "./pdfTheme";

export interface ShippingLabelItem {
  title: string;
  variant?: string;
  quantity: number;
  sku?: string;
  product_id?: string;
}

export interface ShippingLabelOrder {
  id: string;
  order_number: string | null;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: string;
  customer_city?: string;
  postal_code?: string;
  payment_method: string;
  total_amount_pkr: number;
  payment_status?: string;
  order_status: string;
  items: ShippingLabelItem[];
  created_at: string;
  tracking_id?: string | null;
  courier_name?: string | null;
  routing_code?: string | null;
  delivery_instructions?: string | null;
  seller_store_name?: string;
  seller_name?: string;
  seller_phone?: string;
  seller_address?: string;
  seller_city?: string;
  seller_id?: string;
  seller_store_id?: string;
}

// 4x6 inch = 101.6mm x 152.4mm
const LW = 101.6;
const LH = 152.4;
const M = 3;
const CW = LW - M * 2;
const F = "helvetica";

const sectionBox = (d: jsPDF, y: number, h: number) => {
  d.setDrawColor(0);
  d.setLineWidth(0.4);
  d.rect(M, y, CW, h);
};

const sectionTitle = (d: jsPDF, y: number, label: string): number => {
  d.setFillColor(30, 30, 30);
  d.rect(M, y, CW, 4.5, "F");
  d.setTextColor(255, 255, 255);
  d.setFontSize(5.5);
  d.setFont(F, "bold");
  d.text(label.toUpperCase(), M + 1.5, y + 3.2);
  d.setTextColor(0, 0, 0);
  return y + 5.5;
};

export const generateShippingLabel = async (
  order: ShippingLabelOrder,
  siteUrl?: string
): Promise<void> => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [LW, LH] });
  const baseUrl = siteUrl || window.location.origin;
  const ref = order.order_number || order.id.slice(0, 8).toUpperCase();
  const qrUrl = `${baseUrl}/track-order?id=${order.id}`;

  let qrImg: string;
  try {
    qrImg = await QRCode.toDataURL(qrUrl, { width: 200, margin: 1, errorCorrectionLevel: "M" });
  } catch {
    qrImg = await QRCode.toDataURL(order.id, { width: 200, margin: 1 });
  }

  let y = M;

  // ===== HEADER =====
  const hH = 20;
  sectionBox(doc, y, hH);

  // Dark brand bar
  doc.setFillColor(30, 30, 30);
  doc.rect(M, y, CW, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(F, "bold");
  doc.text("FANZOON", M + 2, y + 5.5);
  doc.setFontSize(4.5);
  doc.setFont(F, "normal");
  doc.text("Pakistan's Premium Marketplace", M + 27, y + 5.5);

  // Order ref + date
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont(F, "bold");
  doc.text(ref, M + 2, y + 14);
  doc.setFontSize(5);
  doc.setFont(F, "normal");
  doc.text(
    new Date(order.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }),
    M + 2, y + 17.5
  );

  // QR Code (20mm = 2cm minimum)
  const qS = 18;
  doc.addImage(qrImg, "PNG", LW - M - qS - 1, y + 1, qS, qS);
  y += hH + 1;

  // ===== FROM (SELLER) =====
  const fromH = 16;
  const fromY = sectionTitle(doc, y, "FROM — SELLER / PICKUP");
  sectionBox(doc, y, fromH + 5);
  const sName = order.seller_store_name || order.seller_name || "FANZOON Seller";
  doc.setFontSize(7.5);
  doc.setFont(F, "bold");
  doc.text(trunc(sName, 35), M + 1.5, fromY);
  let sl = fromY + 3.2;
  if (order.seller_phone) {
    doc.setFontSize(7);
    doc.setFont(F, "bold");
    doc.text("Ph: " + order.seller_phone, M + 1.5, sl);
    sl += 3.2;
  }
  if (order.seller_address) {
    doc.setFontSize(5.5);
    doc.setFont(F, "normal");
    const aL = doc.splitTextToSize(order.seller_address, CW - 3);
    doc.text(aL.slice(0, 2), M + 1.5, sl);
    sl += (aL.slice(0, 2) as string[]).length * 2.5;
  }
  if (order.seller_city) {
    doc.setFontSize(6);
    doc.setFont(F, "bold");
    doc.text(order.seller_city.toUpperCase(), M + 1.5, sl);
  }
  if (order.seller_store_id) {
    doc.setFontSize(4.5);
    doc.setFont(F, "normal");
    doc.text("ID: " + order.seller_store_id, LW - M - 22, fromY);
  }
  y += fromH + 6;

  // ===== TO (CUSTOMER) — LARGEST SECTION =====
  const toH = 22;
  const toY = sectionTitle(doc, y, "TO — CUSTOMER / DELIVERY");
  sectionBox(doc, y, toH + 5);

  doc.setFontSize(9);
  doc.setFont(F, "bold");
  doc.text(trunc(order.customer_name, 30), M + 1.5, toY + 0.5);
  let cl = toY + 5;
  if (order.customer_phone) {
    doc.setFontSize(11);
    doc.setFont(F, "bold");
    doc.text(order.customer_phone, M + 1.5, cl);
    cl += 5;
  }
  doc.setFontSize(6.5);
  doc.setFont(F, "normal");
  const cAddr = doc.splitTextToSize(order.shipping_address, CW - 3);
  doc.text(cAddr.slice(0, 3), M + 1.5, cl);
  cl += (cAddr.slice(0, 3) as string[]).length * 2.8;
  const cityPost = [order.customer_city, order.postal_code].filter(Boolean).join(" — ");
  if (cityPost) {
    doc.setFontSize(7);
    doc.setFont(F, "bold");
    doc.text(cityPost.toUpperCase(), M + 1.5, cl);
  }
  y += toH + 6;

  // ===== ITEMS =====
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const iH = Math.min(4 + order.items.length * 3, 16);
  const iY = sectionTitle(doc, y, `ITEMS (${itemCount} pcs)`);
  sectionBox(doc, y, iH + 5);

  doc.setFontSize(5);
  doc.setFont(F, "bold");
  doc.text("PRODUCT", M + 1.5, iY);
  doc.text("SKU", M + 55, iY);
  doc.text("QTY", M + 80, iY);
  let il = iY + 2.8;
  doc.setLineWidth(0.15);
  doc.line(M + 1, il - 1, LW - M - 1, il - 1);
  doc.setFont(F, "normal");
  doc.setFontSize(5.5);
  for (const item of order.items.slice(0, 4)) {
    const nm = trunc(item.title + (item.variant ? ` (${item.variant})` : ""), 36);
    const sk = item.sku || "SKU-" + (item.product_id || "").slice(0, 6).toUpperCase();
    doc.text(nm, M + 1.5, il);
    doc.text(sk, M + 55, il);
    doc.setFont(F, "bold");
    doc.text(String(item.quantity), M + 82, il);
    doc.setFont(F, "normal");
    il += 2.8;
  }
  if (order.items.length > 4) {
    doc.setFontSize(5);
    doc.text("+" + (order.items.length - 4) + " more items", M + 1.5, il);
  }
  y += iH + 6;

  // ===== PAYMENT =====
  const payH = 11;
  const payY = sectionTitle(doc, y, "PAYMENT");
  sectionBox(doc, y, payH + 5);
  const isCOD = order.payment_method?.toLowerCase().includes("cod") || order.payment_method?.toLowerCase().includes("cash");
  const isPaid = order.payment_status === "paid" || !isCOD;
  const amtStr = "Rs. " + order.total_amount_pkr.toLocaleString("en-PK");

  if (isCOD && !isPaid) {
    // Large COD badge
    doc.setFillColor(0, 0, 0);
    doc.rect(M + 1, payY - 2, 12, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont(F, "bold");
    doc.text("COD", M + 3, payY + 1.5);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont(F, "bold");
    doc.text(amtStr, M + 17, payY + 2);
    doc.setFontSize(5);
    doc.setFont(F, "normal");
    doc.text("COLLECT ON DELIVERY", M + 17, payY + 5.5);
  } else {
    doc.setFillColor(22, 163, 74);
    doc.rect(M + 1, payY - 2, 14, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont(F, "bold");
    doc.text("PAID", M + 3.5, payY + 1.5);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont(F, "bold");
    doc.text(amtStr, M + 19, payY + 1.5);
    doc.setFontSize(5);
    doc.setFont(F, "normal");
    doc.text("Method: " + order.payment_method, M + 19, payY + 5);
  }
  y += payH + 6;

  // ===== COURIER =====
  if (order.courier_name || order.tracking_id) {
    const coH = 10;
    const coY = sectionTitle(doc, y, "COURIER / TRACKING");
    sectionBox(doc, y, coH + 5);
    let ccl = coY;
    if (order.courier_name) {
      doc.setFontSize(8);
      doc.setFont(F, "bold");
      doc.text(order.courier_name.toUpperCase(), M + 1.5, ccl);
      ccl += 3.5;
    }
    if (order.tracking_id) {
      doc.setFontSize(7);
      doc.setFont(F, "normal");
      doc.text("Track: ", M + 1.5, ccl);
      doc.setFont(F, "bold");
      doc.text(order.tracking_id, M + 13, ccl);
      ccl += 3;
    }
    if (order.routing_code) {
      doc.setFontSize(6);
      doc.setFont(F, "normal");
      doc.text("Route: " + order.routing_code, M + 1.5, ccl);
    }
    if (order.delivery_instructions) {
      doc.setFontSize(5);
      doc.setFont(F, "italic");
      const instrL = doc.splitTextToSize(order.delivery_instructions, CW / 2);
      doc.text(instrL.slice(0, 2), M + 50, coY);
    }
    y += coH + 6;
  }

  // ===== FOOTER =====
  const fY = LH - 5;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0);
  doc.line(M, fY - 2, LW - M, fY - 2);
  doc.setFontSize(4);
  doc.setFont(F, "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("FANZOON.PK  •  Scan QR to verify  •  Computer generated", LW / 2, fY + 0.5, { align: "center" });
  doc.text("Generated: " + new Date().toLocaleString("en-PK"), LW / 2, fY + 3, { align: "center" });

  doc.save("FANZOON_Label_" + ref + ".pdf");
};
