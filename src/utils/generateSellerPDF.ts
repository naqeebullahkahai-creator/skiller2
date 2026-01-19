import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SellerProfile, isCnicExpired } from '@/hooks/useSellerKyc';

// Load image as base64
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
  } catch (error) {
    console.error('Failed to load image:', error);
    return null;
  }
};

export const generateSellerDossierPDF = async (seller: SellerProfile): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Colors
  const primaryColor: [number, number, number] = [248, 86, 6]; // FANZON Orange #f85606
  const grayColor: [number, number, number] = [100, 100, 100];
  const greenColor: [number, number, number] = [34, 197, 94];
  const redColor: [number, number, number] = [239, 68, 68];

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
  doc.text('Seller Verification Dossier', margin, 35);

  // Verification Status Watermark
  const isVerified = seller.verification_status === 'verified';
  const isPending = seller.verification_status === 'pending';
  const statusText = isVerified ? 'VERIFIED' : isPending ? 'PENDING' : 'REJECTED';
  const statusColor = isVerified ? greenColor : isPending ? [255, 165, 0] as [number, number, number] : redColor;

  doc.setTextColor(...statusColor);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  
  // Draw diagonal watermark
  doc.saveGraphicsState();
  const watermarkX = pageWidth / 2;
  const watermarkY = 150;
  doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
  doc.text(statusText, watermarkX, watermarkY, { 
    align: 'center',
    angle: -30 
  });
  doc.restoreGraphicsState();

  yPos = 55;

  // Document Info
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PK', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 15;

  // Section: Personal Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Information', margin, yPos);
  
  yPos += 5;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 5;

  const personalData = [
    ['Legal Name', seller.legal_name || 'N/A'],
    ['Father/Husband Name', seller.father_husband_name || 'N/A'],
    ['Gender', seller.gender || 'N/A'],
    ['Date of Birth', seller.date_of_birth ? new Date(seller.date_of_birth).toLocaleDateString() : 'N/A'],
    ['CNIC Number', seller.cnic_number || 'N/A'],
    ['CNIC Issue Date', seller.cnic_issue_date ? new Date(seller.cnic_issue_date).toLocaleDateString() : 'N/A'],
    ['CNIC Expiry Date', seller.cnic_expiry_date ? new Date(seller.cnic_expiry_date).toLocaleDateString() : 'N/A'],
  ];

  // Check if CNIC is expired and add warning
  if (seller.cnic_expiry_date && isCnicExpired(seller.cnic_expiry_date)) {
    personalData.push(['⚠️ CNIC Status', 'EXPIRED']);
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: personalData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section: Business Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Information', margin, yPos);
  
  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  const businessData = [
    ['Shop Name', seller.shop_name || 'N/A'],
    ['City', seller.city || 'N/A'],
    ['Business Address', seller.business_address || 'N/A'],
    ['NTN Number', seller.ntn_number || 'Not Provided'],
    ['Emergency Contact', seller.emergency_contact_name || 'N/A'],
    ['Emergency Phone', seller.emergency_contact_phone || 'N/A'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: businessData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section: Banking Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Banking Information', margin, yPos);
  
  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  const bankingData = [
    ['Bank Name', seller.bank_name || 'N/A'],
    ['Account Title', seller.account_title || 'N/A'],
    ['IBAN', seller.iban || 'N/A'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: bankingData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section: Application Status
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Application Status', margin, yPos);
  
  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  const statusData = [
    ['Verification Status', seller.verification_status.toUpperCase()],
    ['Submitted On', new Date(seller.submitted_at).toLocaleDateString()],
    ['Verified On', seller.verified_at ? new Date(seller.verified_at).toLocaleDateString() : 'Not Yet'],
  ];

  if (seller.rejection_reason) {
    statusData.push(['Rejection Reason', seller.rejection_reason]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: statusData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  // New page for documents
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Uploaded Documents', margin, yPos);
  
  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Load and add CNIC images
  const imageWidth = 80;
  const imageHeight = 50;

  if (seller.cnic_front_url) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CNIC Front:', margin, yPos);
    yPos += 5;
    
    const cnicFrontBase64 = await loadImageAsBase64(seller.cnic_front_url);
    if (cnicFrontBase64) {
      try {
        doc.addImage(cnicFrontBase64, 'JPEG', margin, yPos, imageWidth, imageHeight);
        yPos += imageHeight + 10;
      } catch (e) {
        doc.setFont('helvetica', 'italic');
        doc.text('(Image could not be loaded)', margin, yPos + 10);
        yPos += 20;
      }
    }
  }

  if (seller.cnic_back_url) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CNIC Back:', margin, yPos);
    yPos += 5;
    
    const cnicBackBase64 = await loadImageAsBase64(seller.cnic_back_url);
    if (cnicBackBase64) {
      try {
        doc.addImage(cnicBackBase64, 'JPEG', margin, yPos, imageWidth, imageHeight);
        yPos += imageHeight + 10;
      } catch (e) {
        doc.setFont('helvetica', 'italic');
        doc.text('(Image could not be loaded)', margin, yPos + 10);
        yPos += 20;
      }
    }
  }

  if (seller.bank_cheque_url) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Cheque/Statement:', margin, yPos);
    yPos += 5;
    
    const bankChequeBase64 = await loadImageAsBase64(seller.bank_cheque_url);
    if (bankChequeBase64) {
      try {
        doc.addImage(bankChequeBase64, 'JPEG', margin, yPos, imageWidth, imageHeight);
      } catch (e) {
        doc.setFont('helvetica', 'italic');
        doc.text('(Image could not be loaded)', margin, yPos + 10);
      }
    }
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(
      `FANZON Seller Verification Dossier - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'CONFIDENTIAL - For Internal Use Only',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  // Generate filename: [Seller_ID]_[Shop_Name].pdf
  const sanitizedShopName = seller.shop_name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${seller.id.slice(0, 8)}_${sanitizedShopName}.pdf`;

  // Save the PDF
  doc.save(filename);
};
