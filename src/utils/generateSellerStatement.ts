import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

export const generateSellerStatementPDF = async (
  selectedMonth: string,
  earningsData: EarningsDataPoint[],
  stats: TotalStats
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Colors
  const primaryColor: [number, number, number] = [248, 86, 6]; // FANZON Orange
  const grayColor: [number, number, number] = [100, 100, 100];

  // Header with FANZON branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('FANZON', margin, 27);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Sales Statement', margin, 35);

  yPos = 55;

  // Statement period
  const monthDate = new Date(selectedMonth + '-01');
  const monthName = monthDate.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });

  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.text(`Statement Period: ${monthName}`, margin, yPos);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PK', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 20;

  // Summary Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, yPos);
  
  yPos += 5;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Filter earnings for the selected month
  const monthEarnings = earningsData.filter(e => e.date.startsWith(selectedMonth));
  const monthTotal = monthEarnings.reduce((sum, e) => sum + e.earnings, 0);

  const summaryData = [
    ['Total Earnings (This Month)', formatPKR(monthTotal)],
    ['Total Earnings (All Time)', formatPKR(stats.totalEarnings)],
    ['Total Orders', stats.totalOrders.toString()],
    ['Delivered Orders', stats.deliveredOrders.toString()],
    ['Average Order Value', formatPKR(stats.avgOrderValue)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 'auto', halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Daily Earnings Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Earnings Breakdown', margin, yPos);
  
  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  if (monthEarnings.length > 0) {
    const dailyData = monthEarnings.map(e => [
      new Date(e.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
      formatPKR(e.earnings)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Earnings']],
      body: dailyData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: primaryColor },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 'auto', halign: 'right' },
      },
      margin: { left: margin, right: margin },
    });

    // Add total row
    yPos = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Monthly Total: ${formatPKR(monthTotal)}`, pageWidth - margin, yPos, { align: 'right' });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...grayColor);
    doc.text('No earnings data for this month', margin, yPos + 10);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(
      `FANZON Seller Statement - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `FANZON_Statement_${selectedMonth}.pdf`;
  doc.save(filename);
};

export const generateSellerStatementCSV = async (
  selectedMonth: string,
  earningsData: EarningsDataPoint[],
  stats: TotalStats
): Promise<void> => {
  const monthEarnings = earningsData.filter(e => e.date.startsWith(selectedMonth));
  const monthTotal = monthEarnings.reduce((sum, e) => sum + e.earnings, 0);

  // Build CSV content
  let csvContent = 'FANZON Seller Statement\n';
  csvContent += `Statement Period,${new Date(selectedMonth + '-01').toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}\n`;
  csvContent += `Generated,${new Date().toISOString()}\n\n`;

  csvContent += 'SUMMARY\n';
  csvContent += `Total Earnings (This Month),${monthTotal}\n`;
  csvContent += `Total Earnings (All Time),${stats.totalEarnings}\n`;
  csvContent += `Total Orders,${stats.totalOrders}\n`;
  csvContent += `Delivered Orders,${stats.deliveredOrders}\n`;
  csvContent += `Average Order Value,${stats.avgOrderValue}\n\n`;

  csvContent += 'DAILY EARNINGS\n';
  csvContent += 'Date,Earnings (PKR)\n';
  
  monthEarnings.forEach(e => {
    csvContent += `${e.date},${e.earnings}\n`;
  });

  csvContent += `\nMONTHLY TOTAL,${monthTotal}\n`;

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `FANZON_Statement_${selectedMonth}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
