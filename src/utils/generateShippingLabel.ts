import jsPDF from "jspdf";
import QRCode from "qrcode";

// ========== TYPES ==========
interface ShippingLabelItem {
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
const LH_PAGE = 152.4;
const M = 4;
const CW = LW - M * 2;
const F = "helvetica";

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 2) + ".." : s);

const box = (d: jsPDF, y: number, h: number) => {
  d.setDrawColor(0);
  d.setLineWidth(0.3);
  d.rect(M, y, CW, h);
};

const header = (d: jsPDF, y: number, label: string): number => {
  d.setFillColor(0, 0, 0);
  d.rect(M, y, CW, 4, "F");
  d.setTextColor(255, 255, 255);
  d.setFontSize(6);
  d.setFont(F, "bold");
  d.text(label.toUpperCase(), M + 1.5, y + 2.8);
  d.setTextColor(0, 0, 0);
  return y + 5;
};

export const generateShippingLabel = async (
  order: ShippingLabelOrder,
  siteUrl?: string
): Promise<void> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [LW, LH_PAGE],
  });

  const baseUrl = siteUrl || window.location.origin;
  const ref = order.order_number || order.id.slice(0, 8).toUpperCase();
  const qrUrl = `${baseUrl}/track-order?id=${order.id}`;

  let qrImg: string;
  try {
    qrImg = await QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    });
  } catch {
    qrImg = await QRCode.toDataURL(order.id, { width: 200, margin: 1 });
  }

  let y = M;

  // ===== HEADER =====
  const hH = 22;
  box(doc, y, hH);
  doc.setFontSize(14);
  doc.setFont(F, "bold");
  doc.text("FANZON", M + 2, y + 6);
  doc.setFontSize(5);
  doc.setFont(F, "normal");
  doc.text("Pakistan's Premium Marketplace", M + 2, y + 9.5);
  doc.setFontSize(9);
  doc.setFont(F, "bold");
  doc.text(ref, M + 2, y + 15);
  doc.setFontSize(5.5);
  doc.setFont(F, "normal");
  doc.text(
    new Date(order.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }),
    M + 2,
    y + 18.5
  );
  const qS = 18;
  doc.addImage(qrImg, "PNG", LW - M - qS - 1, y + 1.5, qS, qS);
  y += hH + 1;

  // ===== FROM (SELLER) =====
  const sH = 16;
  const sY = header(doc, y, "FROM — SELLER / PICKUP");
  box(doc, y, sH + 5);
  const sName = order.seller_store_name || order.seller_name || "FANZON Seller";
  doc.setFontSize(7.5);
  doc.setFont(F, "bold");
  doc.text(trunc(sName, 35), M + 1.5, sY);
  let sl = sY + 3.2;
  if (order.seller_phone) {
    doc.setFontSize(7);
    doc.setFont(F, "bold");
    doc.text("Ph: " + order.seller_phone, M + 1.5, sl);
    sl += 3.2;
  }
  if (order.seller_address) {
    doc.setFontSize(6);
    doc.setFont(F, "normal");
    const aL = doc.splitTextToSize(order.seller_address, CW - 3);
    doc.text(aL.slice(0, 2), M + 1.5, sl);
    sl += (aL.slice(0, 2) as string[]).length * 2.5;
  }
  if (order.seller_city) {
    doc.setFontSize(6);
    doc.setFont(F, "normal");
    doc.text(order.seller_city, M + 1.5, sl);
  }
  if (order.seller_store_id) {
    doc.setFontSize(5);
    doc.setFont(F, "normal");
    doc.text("ID: " + order.seller_store_id, LW - M - 22, sY);
  }
  y += sH + 6;

  // ===== TO (CUSTOMER) =====
  const cH = 20;
  const cY = header(doc, y, "TO — CUSTOMER / DELIVERY");
  box(doc, y, cH + 5);
  doc.setFontSize(9);
  doc.setFont(F, "bold");
  doc.text(trunc(order.customer_name, 30), M + 1.5, cY);
  let cl = cY + 4;
  if (order.customer_phone) {
    doc.setFontSize(10);
    doc.setFont(F, "bold");
    doc.text(order.customer_phone, M + 1.5, cl);
    cl += 4.5;
  }
  doc.setFontSize(6.5);
  doc.setFont(F, "normal");
  const cAddr = doc.splitTextToSize(order.shipping_address, CW - 3);
  doc.text(cAddr.slice(0, 3), M + 1.5, cl);
  cl += (cAddr.slice(0, 3) as string[]).length * 2.8;
  const cityPost = [order.customer_city, order.postal_code].filter(Boolean).join(" - ");
  if (cityPost) {
    doc.setFontSize(6.5);
    doc.setFont(F, "bold");
    doc.text(cityPost, M + 1.5, cl);
  }
  y += cH + 6;

  // ===== ITEMS =====
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const iH = Math.min(4 + order.items.length * 3.2, 18);
  const iY = header(doc, y, "ITEMS (" + itemCount + " pcs)");
  box(doc, y, iH + 5);
  doc.setFontSize(5.5);
  doc.setFont(F, "bold");
  doc.text("Product", M + 1.5, iY);
  doc.text("SKU", M + 55, iY);
  doc.text("Qty", M + 78, iY);
  let il = iY + 2.8;
  doc.setLineWidth(0.15);
  doc.line(M + 1, il - 1, LW - M - 1, il - 1);
  doc.setFont(F, "normal");
  for (const item of order.items.slice(0, 4)) {
    const nm = trunc(item.title + (item.variant ? " (" + item.variant + ")" : ""), 35);
    const sk = item.sku || "SKU-" + (item.product_id || "").slice(0, 6).toUpperCase();
    doc.text(nm, M + 1.5, il);
    doc.text(sk, M + 55, il);
    doc.text(String(item.quantity), M + 80, il);
    il += 2.8;
  }
  if (order.items.length > 4) {
    doc.setFontSize(5);
    doc.text("+" + (order.items.length - 4) + " more items", M + 1.5, il);
  }
  y += iH + 6;

  // ===== PAYMENT =====
  const pH = 10;
  const pY = header(doc, y, "PAYMENT");
  box(doc, y, pH + 5);
  const isCOD = order.payment_method?.toLowerCase().includes("cod") || order.payment_method?.toLowerCase().includes("cash");
  const isPaid = order.payment_status === "paid" || !isCOD;
  const amtStr = "Rs. " + order.total_amount_pkr.toLocaleString("en-PK");

  if (isCOD && !isPaid) {
    doc.setFillColor(0, 0, 0);
    doc.rect(M + 1, pY - 2.5, 15, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(F, "bold");
    doc.text("COD", M + 3, pY + 1);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(F, "bold");
    doc.text(amtStr, M + 20, pY + 1.5);
    doc.setFontSize(5);
    doc.setFont(F, "normal");
    doc.text("COLLECT ON DELIVERY", M + 20, pY + 5);
  } else {
    doc.setFillColor(0, 0, 0);
    doc.rect(M + 1, pY - 2.5, 16, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(F, "bold");
    doc.text("PAID", M + 3, pY + 1);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont(F, "bold");
    doc.text(amtStr, M + 21, pY + 1);
    doc.setFontSize(5);
    doc.setFont(F, "normal");
    doc.text("Method: " + order.payment_method, M + 21, pY + 5);
  }
  y += pH + 6;

  // ===== COURIER =====
  if (order.courier_name || order.tracking_id) {
    const coH = 10;
    const coY = header(doc, y, "COURIER / TRACKING");
    box(doc, y, coH + 5);
    let ccl = coY;
    if (order.courier_name) {
      doc.setFontSize(8);
      doc.setFont(F, "bold");
      doc.text(order.courier_name, M + 1.5, ccl);
      ccl += 3.5;
    }
    if (order.tracking_id) {
      doc.setFontSize(7);
      doc.setFont(F, "normal");
      doc.text("Track: ", M + 1.5, ccl);
      doc.setFont(F, "bold");
      doc.text(order.tracking_id, M + 14, ccl);
      ccl += 3.2;
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
      doc.text(instrL.slice(0, 2), M + 45, coY);
    }
    y += coH + 6;
  }

  // ===== FOOTER =====
  const fY = LH_PAGE - 6;
  doc.setLineWidth(0.3);
  doc.line(M, fY - 2, LW - M, fY - 2);
  doc.setFontSize(4.5);
  doc.setFont(F, "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("FANZON.PK | Scan QR to verify | Computer generated", LW / 2, fY + 1, { align: "center" });
  doc.text("Generated: " + new Date().toLocaleString("en-PK"), LW / 2, fY + 3.5, { align: "center" });

  doc.save("FANZON_Label_" + ref + ".pdf");
};
