import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  title: string;
  variant?: string;
  quantity: number;
  price_pkr: number;
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
}

const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
};

export const generateOrderInvoice = (order: InvoiceOrder): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with FANZON branding
  doc.setFillColor(243, 136, 58); // Orange brand color
  doc.rect(0, 0, pageWidth, 35, "F");
  
  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("FANZON", 15, 22);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Your Marketplace", 15, 30);
  
  // Invoice title
  doc.setFontSize(14);
  doc.text("INVOICE", pageWidth - 15, 22, { align: "right" });
  
  // Order ID
  doc.setFontSize(10);
  doc.text(order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 15, 30, { align: "right" });
  
  // Reset text color
  doc.setTextColor(51, 51, 51);
  
  // Invoice Date
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${new Date(order.created_at).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`, 15, 50);
  
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
  doc.roundedRect(pageWidth - 55, 42, 40, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(order.order_status.toUpperCase(), pageWidth - 35, 48.5, { align: "center" });
  doc.setTextColor(51, 51, 51);
  
  // Customer Information Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 15, 70);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(order.customer_name, 15, 78);
  if (order.customer_phone) {
    doc.text(order.customer_phone, 15, 85);
  }
  
  // Shipping Address (right side)
  doc.setFont("helvetica", "bold");
  doc.text("Ship To:", pageWidth / 2, 70);
  
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(order.shipping_address, 80);
  doc.text(addressLines, pageWidth / 2, 78);
  
  // Tracking info if available
  if (order.tracking_id && order.courier_name) {
    const trackingY = 78 + addressLines.length * 7;
    doc.setFont("helvetica", "bold");
    doc.text("Courier:", pageWidth / 2, trackingY);
    doc.setFont("helvetica", "normal");
    doc.text(`${order.courier_name} - ${order.tracking_id}`, pageWidth / 2, trackingY + 7);
  }
  
  // Items Table
  const tableStartY = 105;
  
  const tableData = order.items.map((item, index) => [
    (index + 1).toString(),
    item.title + (item.variant ? `\n(${item.variant})` : ""),
    item.quantity.toString(),
    formatPKR(item.price_pkr),
    formatPKR(item.price_pkr * item.quantity),
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [["#", "Product", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [243, 136, 58],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { cellWidth: 75 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 35 },
      4: { halign: "right", cellWidth: 35 },
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
  });
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Summary Section
  const summaryX = pageWidth - 80;
  let currentY = finalY;
  
  // Subtotal
  const subtotal = order.items.reduce((sum, item) => sum + item.price_pkr * item.quantity, 0);
  doc.setFontSize(10);
  doc.text("Subtotal:", summaryX, currentY);
  doc.text(formatPKR(subtotal), pageWidth - 15, currentY, { align: "right" });
  currentY += 8;
  
  // Shipping
  const shipping = order.shipping_charges ?? 150;
  doc.text("Shipping:", summaryX, currentY);
  doc.text(formatPKR(shipping), pageWidth - 15, currentY, { align: "right" });
  currentY += 8;
  
  // Discount if applicable
  if (order.discount_amount && order.discount_amount > 0) {
    doc.setTextColor(76, 175, 80);
    doc.text("Discount:", summaryX, currentY);
    doc.text(`-${formatPKR(order.discount_amount)}`, pageWidth - 15, currentY, { align: "right" });
    doc.setTextColor(51, 51, 51);
    currentY += 8;
  }
  
  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX, currentY, pageWidth - 15, currentY);
  currentY += 8;
  
  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", summaryX, currentY);
  doc.setTextColor(243, 136, 58);
  doc.text(formatPKR(order.total_amount_pkr), pageWidth - 15, currentY, { align: "right" });
  
  // Payment Method
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  currentY += 12;
  doc.text(`Payment Method: ${order.payment_method}`, summaryX, currentY);
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(243, 136, 58);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 10, pageWidth - 15, footerY - 10);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(243, 136, 58);
  doc.text("Thank you for shopping at FANZON!", pageWidth / 2, footerY, { align: "center" });
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("For any queries, contact us at support@fanzon.pk", pageWidth / 2, footerY + 8, { align: "center" });
  doc.text("This is a computer generated invoice", pageWidth / 2, footerY + 15, { align: "center" });
  
  // Save PDF
  const fileName = `FANZON_Invoice_${order.order_number || order.id.slice(0, 8)}.pdf`;
  doc.save(fileName);
};
