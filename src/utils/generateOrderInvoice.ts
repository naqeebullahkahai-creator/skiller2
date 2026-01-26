import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

// High-resolution FANZON Logo as Base64 (optimized for print)
const FANZON_LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Vo8a/M8HG/AaKC6K+i5dHb7n5KfDCMB0TAnMxO8ue+D/SYD7OSGQ8QnKi8EIv0JY/0L6fPEPn3yd4j1iGj47J+bnIZ/QSHgAQmKhH8OIixlMDAw8DiCDM8RMlFoMjfMIDCzYACvCKMAVa/cMwPBCAPM4EvP0gAEbxHN+AMvhE8AE/P/hIZP9A5/Hf6Cd43fR9dErb+Bdf+M/kXM+FgAAABFJREFUeAHtwQEBAAAAgiD/r25IQAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL8GUoAAATKP/GoAAAAASUVORK5CYII=";

const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
};

export const generateOrderInvoice = (order: InvoiceOrder): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // ========== HEADER WITH CENTERED FANZON BRANDING ==========
  // Orange gradient header
  doc.setFillColor(243, 136, 58);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Add subtle darker stripe at bottom of header
  doc.setFillColor(220, 120, 50);
  doc.rect(0, 47, pageWidth, 3, "F");
  
  // FANZON Logo - CENTERED at top
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("FANZON", pageWidth / 2, 22, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Pakistan's Premium Marketplace", pageWidth / 2, 32, { align: "center" });
  
  doc.setFontSize(9);
  doc.text("www.fanzon.pk | support@fanzon.pk", pageWidth / 2, 42, { align: "center" });
  
  // ========== INVOICE TITLE & ORDER INFO ==========
  let currentY = 62;
  
  // Invoice title centered
  doc.setTextColor(243, 136, 58);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth / 2, currentY, { align: "center" });
  
  currentY += 12;
  
  // Order ID and Date row
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(12, currentY - 5, pageWidth - 24, 20, 2, 2, "F");
  
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Order ID: ${order.order_number || order.id.slice(0, 8).toUpperCase()}`, 18, currentY + 5);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`, pageWidth / 2, currentY + 5);
  
  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    pending: [255, 193, 7],
    confirmed: [33, 150, 243],
    processing: [255, 152, 0],
    shipped: [103, 58, 183],
    delivered: [76, 175, 80],
    cancelled: [244, 67, 54],
  };
  
  const statusColor = statusColors[order.order_status] || statusColors.pending;
  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - 55, currentY - 2, 40, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(order.order_status.toUpperCase(), pageWidth - 35, currentY + 6, { align: "center" });
  
  currentY += 28;
  
  // ========== SELLER & BUYER INFO (Two Column Layout) ==========
  const leftColX = 15;
  const rightColX = pageWidth / 2 + 5;
  
  // Seller Info Section (Left)
  doc.setFillColor(255, 248, 240);
  doc.roundedRect(leftColX - 3, currentY - 5, (pageWidth / 2) - 15, 45, 2, 2, "F");
  
  doc.setTextColor(243, 136, 58);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SELLER", leftColX, currentY + 3);
  
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const sellerName = order.seller_store_name || order.items[0]?.seller_name || "FANZON Seller";
  doc.text(sellerName, leftColX, currentY + 13);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const sellerContact = order.seller_contact || order.items[0]?.seller_phone || "";
  if (sellerContact) {
    doc.text(`Contact: ${sellerContact}`, leftColX, currentY + 21);
  }
  const sellerLocation = order.seller_address || order.pickup_location || "";
  if (sellerLocation) {
    const locationLines = doc.splitTextToSize(`Location: ${sellerLocation}`, 80);
    doc.text(locationLines, leftColX, currentY + 29);
  }
  
  // Buyer Info Section (Right)
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(rightColX - 3, currentY - 5, (pageWidth / 2) - 15, 45, 2, 2, "F");
  
  doc.setTextColor(243, 136, 58);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("BUYER", rightColX, currentY + 3);
  
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(order.customer_name, rightColX, currentY + 13);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (order.customer_phone) {
    doc.text(`Phone: ${order.customer_phone}`, rightColX, currentY + 21);
  }
  const addressLines = doc.splitTextToSize(order.shipping_address, 80);
  doc.text(addressLines, rightColX, currentY + 29);
  
  currentY += 55;
  
  // ========== TRACKING INFO ==========
  if (order.tracking_id && order.courier_name) {
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(leftColX - 3, currentY - 5, pageWidth - 24, 18, 2, 2, "F");
    
    doc.setTextColor(56, 142, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Courier: ${order.courier_name}`, leftColX, currentY + 5);
    doc.text(`Tracking ID: ${order.tracking_id}`, rightColX, currentY + 5);
    
    currentY += 23;
  }
  
  // ========== PRODUCTS TABLE ==========
  // Clean table with: Product Name, SKU, Unit Price, Quantity, Subtotal
  const tableData = order.items.map((item) => {
    const productName = item.title + (item.variant ? ` (${item.variant})` : "");
    const sku = item.sku || `SKU-${(item.product_id || "").slice(0, 6).toUpperCase()}`;
    const unitPrice = formatPKR(item.price_pkr);
    const quantity = item.quantity.toString();
    const subtotal = formatPKR(item.price_pkr * item.quantity);
    
    return [productName, sku, unitPrice, quantity, subtotal];
  });
  
  autoTable(doc, {
    startY: currentY,
    head: [["Product Name", "SKU", "Unit Price", "Quantity", "Subtotal"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [243, 136, 58],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 30, halign: "center", fontSize: 8 },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "right", cellWidth: 30, fontStyle: "bold" },
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
  });
  
  // Get final Y position after table
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // ========== SUMMARY SECTION ==========
  const summaryX = pageWidth - 85;
  
  // Summary box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(summaryX - 5, finalY - 5, 75, 60, 3, 3, "F");
  
  // Subtotal
  const subtotal = order.items.reduce((sum, item) => sum + item.price_pkr * item.quantity, 0);
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", summaryX, finalY + 5);
  doc.text(formatPKR(subtotal), pageWidth - 15, finalY + 5, { align: "right" });
  finalY += 10;
  
  // Shipping
  const shipping = order.shipping_charges ?? 150;
  doc.text("Shipping:", summaryX, finalY + 5);
  doc.text(formatPKR(shipping), pageWidth - 15, finalY + 5, { align: "right" });
  finalY += 10;
  
  // Discount if applicable
  if (order.discount_amount && order.discount_amount > 0) {
    doc.setTextColor(76, 175, 80);
    doc.text("Discount:", summaryX, finalY + 5);
    doc.text(`-${formatPKR(order.discount_amount)}`, pageWidth - 15, finalY + 5, { align: "right" });
    doc.setTextColor(80, 80, 80);
    finalY += 10;
  }
  
  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX, finalY + 5, pageWidth - 15, finalY + 5);
  finalY += 12;
  
  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 51, 51);
  doc.text("TOTAL:", summaryX, finalY + 5);
  doc.setTextColor(243, 136, 58);
  doc.text(formatPKR(order.total_amount_pkr), pageWidth - 15, finalY + 5, { align: "right" });
  
  // Payment Method (left side)
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Method: ${order.payment_method}`, 15, finalY + 5);
  
  // ========== BRANDED FOOTER ==========
  const footerY = pageHeight - 40;
  
  // Footer divider - orange line
  doc.setDrawColor(243, 136, 58);
  doc.setLineWidth(2);
  doc.line(15, footerY - 15, pageWidth - 15, footerY - 15);
  
  // Main thank you message - FANZON branded
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(243, 136, 58);
  doc.text("Thank you for shopping on FANZON", pageWidth / 2, footerY - 3, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  doc.text("Pakistan's Premium Marketplace", pageWidth / 2, footerY + 6, { align: "center" });
  
  // Contact info
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("For any queries, contact us at support@fanzon.pk | WhatsApp: +92 300 1234567", pageWidth / 2, footerY + 16, { align: "center" });
  
  // Legal note
  doc.setFontSize(7);
  doc.text("This is a computer-generated invoice. No signature required.", pageWidth / 2, footerY + 24, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleString("en-PK")}`, pageWidth / 2, footerY + 30, { align: "center" });
  
  // Save PDF
  const fileName = `FANZON_Invoice_${order.order_number || order.id.slice(0, 8)}.pdf`;
  doc.save(fileName);
};
