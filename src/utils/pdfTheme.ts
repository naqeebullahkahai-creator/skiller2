/**
 * FANZOON PDF Design System
 * Unified theme for all generated PDF documents
 */
import jsPDF from "jspdf";

// ========== BRAND COLORS ==========
export const COLORS = {
  primary: [30, 30, 30] as [number, number, number],       // Near black
  accent: [248, 86, 6] as [number, number, number],        // FANZOON Orange
  accentLight: [255, 237, 224] as [number, number, number], // Light orange bg
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  gray: [120, 120, 120] as [number, number, number],
  grayLight: [245, 245, 245] as [number, number, number],
  grayMid: [200, 200, 200] as [number, number, number],
  grayDark: [60, 60, 60] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  blue: [37, 99, 235] as [number, number, number],
  yellow: [234, 179, 8] as [number, number, number],
  purple: [124, 58, 237] as [number, number, number],
};

export const STATUS_COLORS: Record<string, [number, number, number]> = {
  pending: COLORS.yellow,
  confirmed: COLORS.blue,
  processing: COLORS.accent,
  shipped: COLORS.purple,
  delivered: COLORS.green,
  cancelled: COLORS.red,
};

// ========== TYPOGRAPHY ==========
const F = "helvetica";

export const setHeading = (doc: jsPDF, size: number, bold = true) => {
  doc.setFont(F, bold ? "bold" : "normal");
  doc.setFontSize(size);
};

export const setBody = (doc: jsPDF, size = 9) => {
  doc.setFont(F, "normal");
  doc.setFontSize(size);
};

export const setBold = (doc: jsPDF, size = 9) => {
  doc.setFont(F, "bold");
  doc.setFontSize(size);
};

// ========== LAYOUT HELPERS ==========
export const formatPKR = (amount: number): string =>
  `Rs. ${amount.toLocaleString("en-PK")}`;

export const formatDate = (dateStr: string, style: "short" | "long" = "long"): string => {
  const opts: Intl.DateTimeFormatOptions =
    style === "short"
      ? { day: "2-digit", month: "short", year: "numeric" }
      : { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-PK", opts);
};

export const trunc = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1) + "…" : s;

// ========== REUSABLE COMPONENTS ==========

/** Draw the branded header bar with FANZOON logo */
export const drawHeader = (
  doc: jsPDF,
  pageWidth: number,
  subtitle: string,
  height = 38
): number => {
  // Dark header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, height, "F");

  // Orange accent stripe
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, height - 3, pageWidth, 3, "F");

  // Logo
  doc.setTextColor(...COLORS.white);
  setHeading(doc, 26);
  doc.text("FANZOON", 15, height / 2 - 2);

  // Subtitle
  setBody(doc, 9);
  doc.setTextColor(200, 200, 200);
  doc.text(subtitle, 15, height / 2 + 7);

  // Right side - website
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(7);
  doc.text("www.fanzoon.pk", pageWidth - 15, height / 2 + 7, { align: "right" });

  return height + 8;
};

/** Draw a section header with orange left border */
export const drawSectionHeader = (
  doc: jsPDF,
  y: number,
  title: string,
  pageWidth: number,
  marginLeft = 15
): number => {
  // Orange left bar
  doc.setFillColor(...COLORS.accent);
  doc.rect(marginLeft, y, 3, 6, "F");

  // Title
  doc.setTextColor(...COLORS.grayDark);
  setHeading(doc, 11);
  doc.text(title.toUpperCase(), marginLeft + 6, y + 5);

  // Subtle line
  doc.setDrawColor(...COLORS.grayMid);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y + 9, pageWidth - 15, y + 9);

  return y + 14;
};

/** Draw the branded footer */
export const drawFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  const fY = pageHeight - 25;

  // Divider
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(1.5);
  doc.line(15, fY, pageWidth - 15, fY);

  // Thank you
  doc.setTextColor(...COLORS.grayDark);
  setHeading(doc, 10);
  doc.text("Thank you for choosing FANZOON", pageWidth / 2, fY + 8, { align: "center" });

  // Contact
  doc.setTextColor(...COLORS.gray);
  setBody(doc, 7);
  doc.text(
    "support@fanzoon.pk  |  WhatsApp: +92 300 1234567  |  www.fanzoon.pk",
    pageWidth / 2,
    fY + 14,
    { align: "center" }
  );

  // Legal
  doc.setFontSize(6);
  doc.text(
    `Computer-generated document  •  ${new Date().toLocaleString("en-PK")}`,
    pageWidth / 2,
    fY + 19,
    { align: "center" }
  );
};

/** Draw a status badge */
export const drawStatusBadge = (
  doc: jsPDF,
  x: number,
  y: number,
  status: string,
  width = 30,
  height = 10
) => {
  const color = STATUS_COLORS[status] || COLORS.gray;
  doc.setFillColor(...color);
  doc.roundedRect(x, y, width, height, 2, 2, "F");
  doc.setTextColor(...COLORS.white);
  setBold(doc, 7);
  doc.text(status.toUpperCase(), x + width / 2, y + height / 2 + 1.5, { align: "center" });
};

/** Draw an info row (label: value) */
export const drawInfoRow = (
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
  maxWidth = 80
): number => {
  doc.setTextColor(...COLORS.gray);
  setBody(doc, 8);
  doc.text(label, x, y);
  doc.setTextColor(...COLORS.black);
  setBold(doc, 9);
  const lines = doc.splitTextToSize(value, maxWidth);
  doc.text(lines.slice(0, 3), x, y + 4);
  return y + 4 + (lines.slice(0, 3) as string[]).length * 3.5;
};
