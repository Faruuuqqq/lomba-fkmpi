import { jsPDF } from 'jspdf';

export function exportToPDF(
  title: string,
  content: string,
  wordCount: number,
  status: string,
  chatHistory: { userPrompt: string; aiResponse: string }[],
  reflection?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
  };

  const addSectionTitle = (title: string) => {
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    addText(title, 16, true);
    yPosition += 5;
    doc.setDrawColor(37, 99, 235);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };

  const addStatsBox = (wordCount: number, status: string, interactions: number) => {
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, yPosition, maxWidth, 30, 3, 3, 'F');
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Word Count:', margin + 10, yPosition);
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.text(wordCount.toString(), margin + 45, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Status:', margin + 80, yPosition);
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.text(status, margin + 105, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('AI Interactions:', margin + 150, yPosition);
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.text(interactions.toString(), margin + 195, yPosition);
    
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
  };

  const addChatItem = (userPrompt: string, aiResponse: string) => {
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.setFillColor(249, 250, 251);
    
    const boxHeight = 30;
    
    if (yPosition > pageHeight - margin - boxHeight) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.roundedRect(margin, yPosition, maxWidth, boxHeight, 3, 3, 'FD');
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Student:', margin + 5, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    const userLines = doc.splitTextToSize(userPrompt, maxWidth - 10);
    userLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin - 5) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += 5;
    });
    
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('MITRA AI:', margin + 5, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'italic', 'normal');
    doc.setTextColor(37, 99, 235);
    const aiLines = doc.splitTextToSize(aiResponse, maxWidth - 10);
    aiLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin - 5) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += 5;
    });
    
    yPosition += 5;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  };

  const addReflection = (reflection: string) => {
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, yPosition, maxWidth, 40, 3, 3, 'F');
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text('Student Reflection:', margin + 5, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(146, 64, 14);
    const reflectionLines = doc.splitTextToSize(reflection, maxWidth - 10);
    reflectionLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin - 5) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += 5;
    });
    
    yPosition += 5;
    doc.setTextColor(0, 0, 0);
  };

  const addFooter = () => {
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Generated by MITRA AI - Academic Writing Assistant | ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  };

  addSectionTitle(title);
  addStatsBox(wordCount, status, chatHistory.length);
  
  addSectionTitle('Essay Content');
  addText(content);
  yPosition += 15;

  if (reflection) {
    addReflection(reflection);
    yPosition += 15;
  }

  if (chatHistory.length > 0) {
    addSectionTitle('AI Discussion Log');
    chatHistory.forEach((chat) => {
      addChatItem(chat.userPrompt, chat.aiResponse);
      yPosition += 10;
    });
  }

  addFooter();

  doc.save(`${title.replace(/\s+/g, '-')}-mitra-ai-report.pdf`);
}
