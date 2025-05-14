// src/components/Laporanmobile.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../utils/exportToPDF';

const Laporanmobile = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const previousMonthBalance = 5000000;

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

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-green-700 text-center">
        Laporan Transaksi Masjid
      </h2>

      {/* Filter Section */}
      <div className="space-y-2">
        <div className="flex flex-col gap-2">
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

        <div className="flex flex-col gap-2">
          <button
            onClick={exportToExcel}
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
      <div className="grid grid-cols-1 gap-3 text-center">
        <div className="bg-green-100 text-green-700 p-3 rounded shadow">
          <h3 className="text-base font-semibold">Total Pemasukan</h3>
          <p className="text-lg font-bold">
            {totalPemasukan.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
          </p>
        </div>
        <div className="bg-red-100 text-red-700 p-3 rounded shadow">
          <h3 className="text-base font-semibold">Total Pengeluaran</h3>
          <p className="text-lg font-bold">
            {totalPengeluaran.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
          </p>
        </div>
        <div className="bg-yellow-100 text-yellow-700 p-3 rounded shadow">
          <h3 className="text-base font-semibold">Saldo Bulan Ini</h3>
          <p className="text-lg font-bold">
            {totalSaldo.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
          </p>
        </div>
      </div>

      {/* Transaksi Card List */}
      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((trx, index) => (
            <div
              key={trx.id}
              className="border rounded-lg p-3 shadow-sm bg-white"
            >
              <div className="text-sm text-gray-500">{trx.date}</div>
              <div className="font-semibold text-gray-800">{trx.description}</div>
              <div className="flex justify-between items-center mt-1">
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    trx.type === 'Pemasukan'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {trx.type}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {trx.amount.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  })}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Saldo: {runningBalance[index].toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">
            Tidak ada data transaksi
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporanmobile;
