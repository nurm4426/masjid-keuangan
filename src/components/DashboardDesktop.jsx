// src/components/DashboardDesktop.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { formatRupiah } from "../utils";  // Mengimpor fungsi formatRupiah

const DashboardDesktop = ({ totalPemasukan, totalPengeluaran, saldo, grafikData, barChartData, perbandinganData }) => {
  const COLORS = ["#16a34a", "#dc2626"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Keuangan Masjid</h1>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded shadow">
          <p className="text-green-800 text-sm">Total Pemasukan</p>
          <p className="text-2xl font-bold text-green-700">
            {formatRupiah(totalPemasukan)}
          </p>
        </div>

        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded shadow">
          <p className="text-red-800 text-sm">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-700">
            {formatRupiah(totalPengeluaran)}
          </p>
        </div>

        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded shadow">
          <p className="text-blue-800 text-sm">Saldo Tersisa</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatRupiah(saldo)}
          </p>
        </div>
      </div>

      {/* Grafik Perbandingan 3 Bulan */}
      <div className="bg-white p-4 rounded shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Perbandingan 3 Bulan Terakhir</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={perbandinganData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis />
            <Tooltip formatter={(value) => formatRupiah(value)} />
            <Legend />
            <Bar dataKey="pemasukan" fill="#16a34a" name="Pemasukan" />
            <Bar dataKey="pengeluaran" fill="#dc2626" name="Pengeluaran" />
            <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Pie */}
      <div className="bg-white p-4 rounded shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Perbandingan Pemasukan vs Pengeluaran</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={grafikData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
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
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Histori Transaksi per Tanggal</h2>
        <ResponsiveContainer width="100%" height={300}>
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

export default DashboardDesktop;
