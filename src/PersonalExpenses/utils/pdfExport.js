import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function addHeader(doc, title, searchDate) {
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);

  const generatedLine = `Generated on ${new Date().toLocaleDateString()}`;
  const filterLine = searchDate ? `  •  Filtered for date: ${searchDate}` : '';

  doc.text(generatedLine + filterLine, 14, 25);
}

function addSummary(doc, lines, startY) {
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  let y = startY;

  lines.forEach((line) => {
    doc.text(line, 14, y);
    y += 6;
  });

  return y;
}

export function exportExpensesPdf(expenses, totalSpent, searchDate) {
  const doc = new jsPDF();

  addHeader(doc, 'Personal Expenses History', searchDate);

  autoTable(doc, {
    startY: 30,

    head: [['Date', 'Category', 'Description', 'Payment', 'Amount (PKR)']],

    body: expenses.map((e) => [
      e.date,
      e.category,
      e.description,
      e.paymentMethod,
      Number(e.amount).toLocaleString(),
    ]),

    headStyles: {
      fillColor: [30, 41, 59],
    },

    styles: {
      fontSize: 9,
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  addSummary(doc, [`Total Spent: PKR ${totalSpent.toLocaleString()}`], finalY);

  doc.save(`expenses-history-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportLoansPdf(
  loanRecords,
  totalGiven,
  totalTaken,
  searchDate
) {
  const doc = new jsPDF();

  addHeader(doc, 'Personal Expenses Loan History', searchDate);

  autoTable(doc, {
    startY: 30,

    head: [['Date', 'Name', 'Description', 'Type', 'Amount (PKR)', 'Status']],

    body: loanRecords.map((r) => [
      r.date,
      r.name,
      r.description || '—',
      r.type,
      Number(r.amount).toLocaleString(),
      r.status,
    ]),

    headStyles: {
      fillColor: [30, 41, 59],
    },

    styles: {
      fontSize: 9,
    },

    columnStyles: {
      2: {
        cellWidth: 45,
      },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  addSummary(
    doc,
    [
      `Total Given: PKR ${totalGiven.toLocaleString()}`,
      `Total Taken: PKR ${totalTaken.toLocaleString()}`,
      `Net Balance: PKR ${(totalGiven - totalTaken).toLocaleString()}`,
    ],
    finalY
  );

  doc.save(`loan-history-${new Date().toISOString().slice(0, 10)}.pdf`);
}
