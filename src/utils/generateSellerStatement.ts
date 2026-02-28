import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  COLORS,
  drawHeader,
  drawSectionHeader,
  drawFooter,
  formatPKR,
  setHeading,
  setBody,
  setBold,
} from "./pdfTheme";

interface EarningsDataPoint {
  date: string;
  earnings: number;
  label: string;
}

interface TotalStats {
  totalEarnings: number;
  totalOrders: number;
  deliveredOrders: number;
  avgOrderValue: number;
}

export const generateSellerStatementPDF = async (
  selectedMonth: string,
  earningsData: EarningsDataPoint[],
  stats: TotalStats
): Promise<void> => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  let y = drawHeader(doc, pw, "SELLER MONTHLY STATEMENT");

  // Period info bar
  const monthDate = new Date(selectedMonth + "-01");
  const monthName = monthDate.toLocaleDateString("en-PK", { month: "long", year: "numeric" });

  doc.setFillColor(...COLORS.grayLight);
  doc.roundedRect(15, y, pw - 30, 14, 2, 2, "F");
  doc.setTextColor(...COLORS.grayDark);
  setBold(doc, 10);
  doc.text(`Period: ${monthName}`, 20, y + 9);
  setBody(doc, 8);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}`, pw - 20, y + 9, { align: "right" });

  y += 22;

  // ===== SUMMARY CARDS =====
  y = drawSectionHeader(doc, y, "Performance Summary", pw);

  const monthEarnings = earningsData.filter((e) => e.date.startsWith(selectedMonth));
  const monthTotal = monthEarnings.reduce((sum, e) => sum + e.earnings, 0);

  const summaryData = [
    ["Total Earnings (This Month)", formatPKR(monthTotal)],
    ["Total Earnings (All Time)", formatPKR(stats.totalEarnings)],
    ["Total Orders", stats.totalOrders.toString()],
    ["Delivered Orders", stats.deliveredOrders.toString()],
    ["Average Order Value", formatPKR(stats.avgOrderValue)],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      1: { cellWidth: "auto", halign: "right" },
    },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      if (data.row.index === 0 && data.column.index === 1) {
        data.cell.styles.textColor = COLORS.accent;
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 12;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== DAILY BREAKDOWN =====
  y = drawSectionHeader(doc, y, "Daily Earnings Breakdown", pw);

  if (monthEarnings.length > 0) {
    const dailyData = monthEarnings.map((e) => [
      new Date(e.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
      formatPKR(e.earnings),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Date", "Earnings"]],
      body: dailyData,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 4, lineColor: COLORS.grayMid, lineWidth: 0.2 },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: "auto", halign: "right" },
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
    doc.setTextColor(...COLORS.accent);
    setHeading(doc, 11);
    doc.text(`Monthly Total: ${formatPKR(monthTotal)}`, pw - 15, y, { align: "right" });
  } else {
    doc.setTextColor(...COLORS.gray);
    setBody(doc, 10);
    doc.text("No earnings data for this month", 15, y + 10);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, pw, ph);
  }

  doc.save(`FANZOON_Statement_${selectedMonth}.pdf`);
};

export const generateSellerStatementCSV = async (
  selectedMonth: string,
  earningsData: EarningsDataPoint[],
  stats: TotalStats
): Promise<void> => {
  const monthEarnings = earningsData.filter((e) => e.date.startsWith(selectedMonth));
  const monthTotal = monthEarnings.reduce((sum, e) => sum + e.earnings, 0);

  let csv = "FANZOON Seller Statement\n";
  csv += `Statement Period,${new Date(selectedMonth + "-01").toLocaleDateString("en-PK", { month: "long", year: "numeric" })}\n`;
  csv += `Generated,${new Date().toISOString()}\n\n`;
  csv += "SUMMARY\n";
  csv += `Total Earnings (This Month),${monthTotal}\n`;
  csv += `Total Earnings (All Time),${stats.totalEarnings}\n`;
  csv += `Total Orders,${stats.totalOrders}\n`;
  csv += `Delivered Orders,${stats.deliveredOrders}\n`;
  csv += `Average Order Value,${stats.avgOrderValue}\n\n`;
  csv += "DAILY EARNINGS\nDate,Earnings (PKR)\n";
  monthEarnings.forEach((e) => { csv += `${e.date},${e.earnings}\n`; });
  csv += `\nMONTHLY TOTAL,${monthTotal}\n`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `FANZOON_Statement_${selectedMonth}.csv`;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
