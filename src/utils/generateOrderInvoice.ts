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

// FANZON Logo as Base64 (orange F on transparent)
const FANZON_LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE8ElEQVR4nO2dW4hVVRjHf+OYmZaVlZVZWVZaZFSWZd4qLcvKrCzLrKzM8lJRlJWVlZVZWZWVlZWVWVmWZWVlZWVlZWVlZWVZVlZWVpbl5fh9sOZ0GGfOnDNnn7XXnv19sGCYOWvv7/+ttdZe+18r0Wg0Go1Go9FoNBqNRqPRaDQajUaj0Wg0Go1Go9FoNBrRQdIcSYslLZb0i6SbcO7Av0u6S9J4SVMkXS/pS0l/S0riOCT9Jul3ST9I+lrS55K+kPSZpE8lfSJpsaR/JI0v+nnqhqRukrpL6iFpL0l7SNpd0m6Sdpa0k6QdJW0vaVtJPSX1lNRD0taSNpfUXdJmkjaVtImkjSVtJGlDSd0kdZO0gaSukrpI6iyps6ROkjpK6iCpvaR2klpJai2pRFILSc0lNZPURFITSY0lNZLUSFJDSQ0kNZBUX1K9+E9Kiv+klvGf1Cr+k9rFf9LO8Z+0T/wnHRT/ScfGf9Jp8Z90VvwnnRf/SZfEf1J6/CfdEP9Jd8V/0oPxn/R0/Cd9FP9J38R/0tL4T/ot/pM2xn9SSvwntY7/pD3iP+ng+E86Kf6TLoz/pGvjP+n++E96Lv6TlsR/0qr4T0qJ/6Tu8Z+0T/wnHRP/SWfHf1J6/CfdHP9JT8R/0nvxn/R9/Cf9E/9J3eI/6YD4T0qL/6Tr4z/p8fhP+jD+k76L/6S18Z/UOf6TTo3/pIvjP+mO+E96Jv6TFsd/0sr4T/o5/pN2jP+k4+I/6eL4T3oo/pPej/+k7+M/aV38J/WO/6T0+E+6Jf6TXov/pC/jP2lN/Cf1i/+kk+M/6dr4T3om/pOWxH/SivhPWhf/Sb3jP+nE+E+6Kv6THo3/pI/jP+mn+E/aEP9Jg+I/6Yz4T7o1/pNejP+kb+I/aXX8Jw2M/6T0+E+6P/6T5sd/0g/xn7Qx/pMGx3/SmfGfdFf8Jy2I/6Sf4j9pY/wnDYv/pHPjP+nR+E/6LP6TVsV/0ob4TxoR/0mXx3/SvPhP+jn+k9bHf9LI+E+6MP6Tnon/pGXxn7Q6/pM2xH/SqPhPuir+kxbGf9Kv8Z+0Lv6TRsd/0iXxn/RS/CetiP+k3+I/aX38J42N/6Rr4j/p9fhP+j3+k9bGf9L4+E+6Nv6TFsV/0sr4T1ob/0kT4j/puvhP+iD+k1bFf9La+E+aFP9JN8R/0sfxn/RH/CetjP+kyfGfdGP8J30Z/0l/xn/S7/GfNDX+k26K/6Sv4z/pr/hP+iv+k6bHf9LN8Z/0bfwn/R3/SX/Hf9KM+E+6Jf6Tvov/pH/iP+nf+E+aFf9Jt8Z/0or4T1ob/0lz4j/pjvhPWhX/SX/Hf9K8+E+6M/6TVsd/0j/xnzQ//pPujv+kNfGf9G/8Jy2I/6R74z9pXfwn/Rf/SQvjP+n++E/6K/6T/o//pIfiP+nh+E/6N/6T/o//pEXxn/RI/Cf9F/9J/8V/0mPxn/RE/CeljP+kp+I/6Zn4T3o2/pOei/+k5+M/6YX4T3ox/pNeiv+kl+M/6ZX4T3o1/pNei/+k1+M/6Y34T3oz/pPeiv+kt+M/6Z34T5ob/0nvxn/Se/Gf9H78J30Q/0kfxn/SR/Gf9HH8J30S/0mfxn/SZ/Gf9Hn8J30R/0lfxn/SV/Gf9HX8J30T/0nfxn/Sd/Gf9H38J/0Q/0k/xn/ST/Gf9HP8J/0S/0nL4z/p1/hPSov/pN/iP+n3+E/6I/6T/oz/pL/iP2lF/Cf9Hf9Jf8d/0j/xn/Rv/Cf9F/9J/8d/UhL/Sf8DqQQKqQKJmScAAAAASUVORK5CYII=";

const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
};

export const generateOrderInvoice = (order: InvoiceOrder): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with FANZON branding
  doc.setFillColor(243, 136, 58); // Orange brand color
  doc.rect(0, 0, pageWidth, 40, "F");
  
  // Add FANZON Logo
  try {
    doc.addImage(FANZON_LOGO_BASE64, "PNG", 12, 5, 30, 30);
  } catch (e) {
    // Fallback to text if image fails
    console.log("Logo image failed, using text fallback");
  }
  
  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("FANZON", 45, 22);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Your Marketplace", 45, 30);
  
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
  })}`, 15, 55);
  
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
  doc.roundedRect(pageWidth - 55, 47, 40, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(order.order_status.toUpperCase(), pageWidth - 35, 53.5, { align: "center" });
  doc.setTextColor(51, 51, 51);
  
  // Customer Information Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 15, 75);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(order.customer_name, 15, 83);
  if (order.customer_phone) {
    doc.text(order.customer_phone, 15, 90);
  }
  
  // Shipping Address (right side)
  doc.setFont("helvetica", "bold");
  doc.text("Ship To:", pageWidth / 2, 75);
  
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(order.shipping_address, 80);
  doc.text(addressLines, pageWidth / 2, 83);
  
  // Tracking info if available
  if (order.tracking_id && order.courier_name) {
    const trackingY = 83 + addressLines.length * 7;
    doc.setFont("helvetica", "bold");
    doc.text("Courier:", pageWidth / 2, trackingY);
    doc.setFont("helvetica", "normal");
    doc.text(`${order.courier_name} - ${order.tracking_id}`, pageWidth / 2, trackingY + 7);
  }

  // Seller Information (if available from first item)
  const sellerInfo = order.items[0];
  if (sellerInfo?.seller_name) {
    doc.setFont("helvetica", "bold");
    doc.text("Seller:", 15, 100);
    doc.setFont("helvetica", "normal");
    doc.text(sellerInfo.seller_name, 15, 107);
    if (sellerInfo.seller_phone) {
      doc.text(sellerInfo.seller_phone, 15, 114);
    }
  }
  
  // Items Table
  const tableStartY = 125;
  
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
