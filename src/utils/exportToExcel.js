import * as XLSX from 'xlsx';

export const exportToExcel = (allTransactions, selectedYear, previousBalances) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const wb = XLSX.utils.book_new();

  for (let i = 0; i < 12; i++) {
    const monthIndex = i + 1;
    const monthStr = monthIndex.toString().padStart(2, '0');
    const monthName = months[i];

    // Filter transaksi bulan ini
    const transactions = allTransactions
      .filter(trx => trx.date.startsWith(`${selectedYear}-${monthStr}`))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = previousBalances[monthStr] || 0;
    const rows = [
      ['Tanggal', 'Deskripsi', 'Jenis', 'Jumlah (IDR)', 'Saldo (IDR)']
    ];

    transactions.forEach(trx => {
      runningBalance += trx.type === 'Pemasukan' ? trx.amount : -trx.amount;
      rows.push([
        trx.date,
        trx.description,
        trx.type,
        trx.amount,
        runningBalance
      ]);
    });

    // Ringkasan
    const totalMasuk = transactions.filter(trx => trx.type === 'Pemasukan')
                                   .reduce((sum, trx) => sum + trx.amount, 0);
    const totalKeluar = transactions.filter(trx => trx.type === 'Pengeluaran')
                                    .reduce((sum, trx) => sum + trx.amount, 0);
    const saldoAkhir = totalMasuk - totalKeluar;

    rows.push([]);
    rows.push(['Ringkasan']);
    rows.push(['Total Pemasukan', totalMasuk]);
    rows.push(['Total Pengeluaran', totalKeluar]);
    rows.push(['Saldo Bulan Ini', saldoAkhir]);

    // Narasi
    const prevMonth = new Date(`${selectedYear}-${monthStr}-01`);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const currMonthStr = new Date(`${selectedYear}-${monthStr}-01`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    let narasi = '';
    if (transactions.length === 0) {
      narasi = `Tidak ada transaksi pada bulan ${monthName} ${selectedYear}. Saldo tetap.`;
    } else if (saldoAkhir > 0) {
      narasi = `Saldo akhir bulan ${prevMonthStr} adalah Rp ${(runningBalance - saldoAkhir).toLocaleString('id-ID')}. Transaksi bulan ini menyebabkan kenaikan saldo sebesar Rp ${saldoAkhir.toLocaleString('id-ID')}. Dengan demikian, saldo akhir bulan ${currMonthStr} adalah Rp ${runningBalance.toLocaleString('id-ID')}.`;
    } else if (saldoAkhir < 0) {
      narasi = `Saldo akhir bulan ${prevMonthStr} adalah Rp ${(runningBalance - saldoAkhir).toLocaleString('id-ID')}. Transaksi bulan ini menyebabkan penurunan saldo sebesar Rp ${Math.abs(saldoAkhir).toLocaleString('id-ID')}. Dengan demikian, saldo akhir bulan ${currMonthStr} adalah Rp ${runningBalance.toLocaleString('id-ID')}.`;
    } else {
      narasi = `Transaksi bulan ini tidak menyebabkan perubahan saldo. Saldo tetap Rp ${runningBalance.toLocaleString('id-ID')}.`;
    }

    rows.push([]);
    rows.push(['Narasi']);
    rows.push([narasi]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, monthName);
  }

  XLSX.writeFile(wb, `Laporan_Keuangan_Masjid_${selectedYear}.xlsx`);
};
