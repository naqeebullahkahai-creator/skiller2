import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SellerProfile, isCnicExpired } from "@/hooks/useSellerKyc";
import {
  COLORS,
  drawHeader,
  drawSectionHeader,
  drawFooter,
  setHeading,
  setBody,
  setBold,
} from "./pdfTheme";

const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generateSellerDossierPDF = async (seller: SellerProfile): Promise<void> => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  let y = drawHeader(doc, pw, "SELLER VERIFICATION DOSSIER");

  // ===== STATUS WATERMARK =====
  const isVerified = seller.verification_status === "verified";
  const isPending = seller.verification_status === "pending";
  const statusText = isVerified ? "VERIFIED" : isPending ? "PENDING" : "REJECTED";
  const statusColor = isVerified ? COLORS.green : isPending ? COLORS.yellow : COLORS.red;

  doc.setTextColor(...statusColor);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
  doc.text(statusText, pw / 2, 160, { align: "center", angle: -30 });
  doc.restoreGraphicsState();

  // Generated date
  doc.setTextColor(...COLORS.gray);
  setBody(doc, 8);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    pw - 15, y, { align: "right" }
  );
  y += 10;

  // ===== PERSONAL INFO =====
  y = drawSectionHeader(doc, y, "Personal Information", pw);

  const personalData = [
    ["Legal Name", seller.legal_name || "N/A"],
    ["Father/Husband Name", seller.father_husband_name || "N/A"],
    ["Gender", seller.gender || "N/A"],
    ["Date of Birth", seller.date_of_birth ? new Date(seller.date_of_birth).toLocaleDateString() : "N/A"],
    ["CNIC Number", seller.cnic_number || "N/A"],
    ["CNIC Issue Date", seller.cnic_issue_date ? new Date(seller.cnic_issue_date).toLocaleDateString() : "N/A"],
    ["CNIC Expiry Date", seller.cnic_expiry_date ? new Date(seller.cnic_expiry_date).toLocaleDateString() : "N/A"],
  ];
  if (seller.cnic_expiry_date && isCnicExpired(seller.cnic_expiry_date)) {
    personalData.push(["⚠️ CNIC Status", "EXPIRED"]);
  }

  autoTable(doc, {
    startY: y,
    head: [],
    body: personalData,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 }, 1: { cellWidth: "auto" } },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      if (data.row.index === personalData.length - 1 && personalData[personalData.length - 1][0].includes("⚠️")) {
        data.cell.styles.textColor = COLORS.red;
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ===== BUSINESS INFO =====
  y = drawSectionHeader(doc, y, "Business Information", pw);

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ["Shop Name", seller.shop_name || "N/A"],
      ["City", seller.city || "N/A"],
      ["Business Address", seller.business_address || "N/A"],
      ["NTN Number", seller.ntn_number || "Not Provided"],
      ["Emergency Contact", seller.emergency_contact_name || "N/A"],
      ["Emergency Phone", seller.emergency_contact_phone || "N/A"],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 }, 1: { cellWidth: "auto" } },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ===== BANKING INFO =====
  y = drawSectionHeader(doc, y, "Banking Information", pw);

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ["Bank Name", seller.bank_name || "N/A"],
      ["Account Title", seller.account_title || "N/A"],
      ["IBAN", seller.iban || "N/A"],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 }, 1: { cellWidth: "auto" } },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ===== APPLICATION STATUS =====
  y = drawSectionHeader(doc, y, "Application Status", pw);

  const statusData: string[][] = [
    ["Verification Status", seller.verification_status.toUpperCase()],
    ["Submitted On", new Date(seller.submitted_at).toLocaleDateString()],
    ["Verified On", seller.verified_at ? new Date(seller.verified_at).toLocaleDateString() : "Not Yet"],
  ];
  if (seller.rejection_reason) statusData.push(["Rejection Reason", seller.rejection_reason]);

  autoTable(doc, {
    startY: y,
    head: [],
    body: statusData,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 }, 1: { cellWidth: "auto" } },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      if (data.row.index === 0 && data.column.index === 1) {
        data.cell.styles.textColor = statusColor;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ===== DOCUMENTS PAGE =====
  doc.addPage();
  y = drawHeader(doc, pw, "UPLOADED DOCUMENTS") + 5;

  const imageWidth = 80;
  const imageHeight = 50;

  const docImages = [
    { label: "CNIC Front", url: seller.cnic_front_url },
    { label: "CNIC Back", url: seller.cnic_back_url },
    { label: "Bank Cheque/Statement", url: seller.bank_cheque_url },
  ];

  for (const img of docImages) {
    if (!img.url) continue;
    y = drawSectionHeader(doc, y, img.label, pw);
    const base64 = await loadImageAsBase64(img.url);
    if (base64) {
      try {
        doc.addImage(base64, "JPEG", 15, y, imageWidth, imageHeight);
        y += imageHeight + 10;
      } catch {
        doc.setTextColor(...COLORS.gray);
        setBody(doc, 9);
        doc.text("(Image could not be loaded)", 15, y + 10);
        y += 18;
      }
    }
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, pw, ph);
    // Confidential stamp
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.red);
    doc.text("CONFIDENTIAL — For Internal Use Only", pw / 2, ph - 8, { align: "center" });
  }

  const sanitizedName = seller.shop_name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`FANZOON_Seller_${seller.id.slice(0, 8)}_${sanitizedName}.pdf`);
};
