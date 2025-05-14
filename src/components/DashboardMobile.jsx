// src/components/DashboardMobile.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { formatRupiah } from "../utils";  // Mengimpor fungsi formatRupiah

const DashboardMobile = ({ totalPemasukan, totalPengeluaran, saldo, grafikData, barChartData, perbandinganData }) => {
  const COLORS = ["#16a34a", "#dc2626"];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-center mb-4">Dashboard Keuangan Masjid</h1>

      {/* Kartu Ringkasan */}
      <div className="space-y-4 mb-6">
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded shadow-sm">
          <p className="text-green-800 text-sm">Total Pemasukan</p>
          <p className="text-xl font-semibold text-green-700">
            {formatRupiah(totalPemasukan)}
          </p>
        </div>

        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p className="text-red-800 text-sm">Total Pengeluaran</p>
          <p className="text-xl font-semibold text-red-700">
            {formatRupiah(totalPengeluaran)}
          </p>
        </div>

        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded shadow-sm">
          <p className="text-blue-800 text-sm">Saldo Tersisa</p>
          <p className="text-xl font-semibold text-blue-700">
            {formatRupiah(saldo)}
          </p>
        </div>
      </div>

      {/* Grafik Perbandingan 3 Bulan */}
      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Perbandingan 3 Bulan Terakhir</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={perbandinganData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis />
            <Tooltip formatter={(value) => formatRupiah(value)} />
            <Legend />
            <Bar dataKey="pemasukan" fill="#16a34a" name="Pemasukan" />
            <Bar dataKey="pengeluaran" fill="#dc2626" name="Pengeluaran" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Pie */}
      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Perbandingan Pemasukan vs Pengeluaran</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={grafikData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
              {grafikData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Bar */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-center">Histori Transaksi per Tanggal</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `Rp${value / 1000}k`} />
            <Tooltip formatter={(value) => formatRupiah(value)} />
            <Legend />
            <Bar dataKey="pemasukan" fill="#16a34a" name="Pemasukan" />
            <Bar dataKey="pengeluaran" fill="#dc2626" name="Pengeluaran" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardMobile;
