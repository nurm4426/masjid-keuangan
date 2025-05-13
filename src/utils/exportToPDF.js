// src/utils/exportToPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = async (transactions, selectedMonth, selectedYear, previousMonthBalance) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load logo
  const logoImg = new Image();
  logoImg.src = '/logo-masjid.png';
  await new Promise((resolve) => {
    logoImg.onload = resolve;
  });

  // Tambah logo
  doc.addImage(logoImg, 'PNG', 10, 10, 20, 20);

  // Header
  const headerX = 35;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(34, 139, 34);
  doc.text('LAPORAN KEUANGAN MASJID AL-IHSAN', headerX, 15);

  const bulanNama = new Date(`${selectedYear}-${selectedMonth}-01`).toLocaleDateString('id-ID', {
    month: 'long', year: 'numeric',
  });
  const previousMonthDate = new Date(`${selectedYear}-${selectedMonth}-01`);
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthName = previousMonthDate.toLocaleDateString('id-ID', {
    month: 'long', year: 'numeric',
  });

  doc.setFontSize(13);
  doc.setTextColor(218, 165, 32);
  doc.text(`Periode: ${bulanNama}`, headerX, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Sekretariat: Jl. Wibisono No. 75 B Kepatihan Ponorogo 63416 (Telp: 0852 3280 7976)', headerX, 28);

  doc.setDrawColor(160);
  doc.setLineWidth(0.5);
  doc.line(10, 32, pageWidth - 10, 32);

  // Tabel transaksi
  const tableColumn = ['Tanggal', 'Deskripsi', 'Jenis', 'Jumlah (IDR)', 'Saldo (IDR)'];
  let runningBalance = 0;

  const tableRows = transactions.map((trx) => {
    runningBalance += trx.type === 'Pemasukan' ? trx.amount : -trx.amount;
    return [
      trx.date,
      trx.description,
      trx.type,
      trx.amount.toLocaleString('id-ID'),
      runningBalance.toLocaleString('id-ID'),
    ];
  });

  autoTable(doc, {
    startY: 36,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: {
      fillColor: [34, 139, 34],
      textColor: 255,
      halign: 'center',
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, pageWidth - 30, pageHeight - 10);
    },
  });

  // Ringkasan
  const totalMasuk = transactions.filter(trx => trx.type === 'Pemasukan').reduce((sum, trx) => sum + trx.amount, 0);
  const totalKeluar = transactions.filter(trx => trx.type === 'Pengeluaran').reduce((sum, trx) => sum + trx.amount, 0);
  const totalSaldo = totalMasuk - totalKeluar;
  const summaryStartY = doc.lastAutoTable.finalY + 10;

  doc.setDrawColor(180);
  doc.line(10, summaryStartY - 5, pageWidth - 10, summaryStartY - 5);

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Pemasukan: Rp ${totalMasuk.toLocaleString('id-ID')}`, 10, summaryStartY);
  doc.text(`Total Pengeluaran: Rp ${totalKeluar.toLocaleString('id-ID')}`, 10, summaryStartY + 6);
  doc.text(`Saldo Bulan Ini: Rp ${totalSaldo.toLocaleString('id-ID')}`, 10, summaryStartY + 12);

  // Narasi perbandingan saldo
  const comparisonStartY = summaryStartY + 20;
  const saldoChange = totalSaldo;
  const saldoChangeText =
    saldoChange === 0
      ? `Transaksi bulan ini tidak menyebabkan perubahan saldo keseluruhan.`
      : saldoChange > 0
      ? `Transaksi bulan ini menyebabkan kenaikan saldo keseluruhan sebesar Rp ${saldoChange.toLocaleString('id-ID')}.`
      : `Transaksi bulan ini menyebabkan penurunan saldo keseluruhan sebesar Rp ${Math.abs(saldoChange).toLocaleString('id-ID')}.`;

  const highlightText = `Saldo akhir bulan ${previousMonthName} adalah Rp ${previousMonthBalance.toLocaleString('id-ID')}. ${saldoChangeText} Dengan demikian, saldo akhir keseluruhan untuk bulan ${bulanNama} adalah Rp ${(previousMonthBalance + saldoChange).toLocaleString('id-ID')}.`;

  const textLines = doc.splitTextToSize(highlightText, pageWidth - 30);
  const lineHeight = 5;
  const boxPadding = 5;
  const iconSize = 6;
  const boxHeight = textLines.length * lineHeight + boxPadding * 2;

  const boxX = 10;
  const boxY = comparisonStartY;
  const textX = boxX + 8 + iconSize; // spasi setelah ikon
  const textY = boxY + boxPadding + 2;

  // Kotak biru profesional
  doc.setFillColor(230, 240, 255);
  doc.setDrawColor(0, 102, 204);
  doc.roundedRect(boxX, boxY, pageWidth - 20, boxHeight, 3, 3, 'FD');

  // Garis vertikal tebal
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(1.5);
  doc.line(boxX + 2, boxY + 2, boxX + 2, boxY + boxHeight - 2);

  // Ikon ℹ️
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('ℹ️', boxX + 5, textY); // ikon di samping garis vertikal

  // Teks narasi
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 102);
  doc.text(textLines, textX, textY);

  // Simpan file PDF
  doc.save(`Laporan_Keuangan_Masjid_${bulanNama}.pdf`);
};
