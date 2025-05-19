// src/components/Laporan.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../utils/exportToPDF';
import { exportToExcel } from '../utils/exportToExcel';

const Laporan = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // 👇 Tambahkan ini sesuai nilai saldo akhir bulan sebelumnya
  const previousMonthBalance = 52991000;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'transactions'));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleFilter = () => {
    if (!selectedMonth || !selectedYear) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter((trx) => {
      const trxDate = new Date(trx.date);
      const month = (trxDate.getMonth() + 1).toString().padStart(2, '0');
      const year = trxDate.getFullYear().toString();
      return month === selectedMonth && year === selectedYear;
    });

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredTransactions(filtered);
  };

  const exportToExcel = () => {
    const worksheetData = filteredTransactions.map((trx, index) => ({
      Tanggal: trx.date,
      Deskripsi: trx.description,
      Jenis: trx.type,
      Jumlah: trx.amount,
      Saldo: getRunningBalance()[index],
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, 'Laporan_Transaksi_Masjid.xlsx');
  };

  const totalPemasukan = filteredTransactions
    .filter((trx) => trx.type === 'Pemasukan')
    .reduce((sum, trx) => sum + trx.amount, 0);

  const totalPengeluaran = filteredTransactions
    .filter((trx) => trx.type === 'Pengeluaran')
    .reduce((sum, trx) => sum + trx.amount, 0);

  const totalSaldo = totalPemasukan - totalPengeluaran;

  const getRunningBalance = () => {
    let saldo = 0;
    return filteredTransactions.map((trx) => {
      saldo += trx.type === 'Pemasukan' ? trx.amount : -trx.amount;
      return saldo;
    });
  };

  const runningBalance = getRunningBalance();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header dan Filter */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-green-700">
          Laporan Transaksi Masjid
        </h2>
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">-- Pilih Bulan --</option>
            {[...Array(12)].map((_, i) => {
              const m = (i + 1).toString().padStart(2, '0');
              return <option key={m} value={m}>{m}</option>;
            })}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">-- Pilih Tahun --</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
          <button
            onClick={handleFilter}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Filter
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() =>
                exportToExcel(filteredTransactions, selectedMonth, selectedYear, previousMonthBalance)
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Ekspor Excel
          </button>
          <button
            onClick={() =>
              exportToPDF(filteredTransactions, selectedMonth, selectedYear, previousMonthBalance)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Ekspor PDF
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-green-100 text-green-700 p-4 rounded shadow">
          <h3 className="text-xl font-semibold">Total Pemasukan</h3>
          <p className="text-2xl font-bold">
            {totalPemasukan.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
          </p>
        </div>
        <div className="bg-red-100 text-red-700 p-4 rounded shadow">
          <h3 className="text-xl font-semibold">Total Pengeluaran</h3>
          <p className="text-2xl font-bold">
            {totalPengeluaran.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
          </p>
        </div>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded shadow">
          <h3 className="text-xl font-semibold">Saldo Bulan Ini</h3>
          <p className="text-2xl font-bold">
            {totalSaldo.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
          </p>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="p-2 border">Tanggal</th>
              <th className="p-2 border">Deskripsi</th>
              <th className="p-2 border">Jenis</th>
              <th className="p-2 border">Jumlah</th>
              <th className="p-2 border">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              <>
                {filteredTransactions.map((trx, index) => (
                  <tr key={trx.id} className="text-gray-800">
                    <td className="p-2 border">{trx.date}</td>
                    <td className="p-2 border">{trx.description}</td>
                    <td className="p-2 border text-center">
                      <span
                        className={`px-2 py-1 text-sm font-semibold rounded-full ${
                          trx.type === 'Pemasukan'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {trx.type}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {trx.amount.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      })}
                    </td>
                    <td className="p-2 border font-semibold">
                      {runningBalance[index].toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      })}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-yellow-50">
                  <td colSpan="4" className="p-2 border text-right">
                    Total Saldo Bulan Ini
                  </td>
                  <td className="p-2 border">
                    {totalSaldo.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    })}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Tidak ada data transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Laporan;
