import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToPDF = (title: string, headers: string[], data: any[][], filename: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, 30);
  
  // Add table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 40,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  
  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
