import React from 'react'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import Papa from 'papaparse'

const Report = () => {
  const financialData = [
    { date: '2025-05-01', description: 'Pemasukan Donasi', amount: 500000 },
    { date: '2025-05-02', description: 'Pembayaran Zakat', amount: 300000 },
    { date: '2025-05-03', description: 'Pengeluaran Operasional', amount: -200000 },
  ]

  const totalIncome = financialData
    .filter(item => item.amount > 0)
    .reduce((acc, item) => acc + item.amount, 0)

  const totalExpense = financialData
    .filter(item => item.amount < 0)
    .reduce((acc, item) => acc + Math.abs(item.amount), 0)

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(financialData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan')
    XLSX.writeFile(wb, 'Laporan_Keuangan.xlsx')
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Keuangan Masjid', 20, 10)
    doc.text(`Pemasukan: ${totalIncome.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`, 20, 20)
    doc.text(`Pengeluaran: ${totalExpense.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`, 20, 30)

    financialData.forEach((item, index) => {
      doc.text(`${item.date} - ${item.description} - ${item.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`, 20, 40 + index * 10)
    })

    doc.save('Laporan_Keuangan.pdf')
  }

  const handleExportCSV = () => {
    const csv = Papa.unparse(financialData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'Laporan_Keuangan.csv'
    link.click()
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-semibold text-gray-700">Laporan Keuangan Masjid</h2>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-600">Pemasukan: {totalIncome.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</h3>
        <h3 className="text-xl font-semibold text-gray-600">Pengeluaran: {totalExpense.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</h3>
      </div>

      {/* Tombol Ekspor */}
      <div className="flex space-x-4 mt-4">
        <button onClick={handleExportExcel} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Ekspor ke Excel</button>
        <button onClick={handleExportPDF} className="px-4 py-2 bg-green-500 text-white rounded-lg">Ekspor ke PDF</button>
        <button onClick={handleExportCSV} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Ekspor ke CSV</button>
      </div>

      {/* Tabel Laporan Keuangan */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Tanggal</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Deskripsi</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {financialData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{item.date}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{item.description}</td>
                <td className={`py-3 px-4 text-sm ${item.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {item.amount.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Report
