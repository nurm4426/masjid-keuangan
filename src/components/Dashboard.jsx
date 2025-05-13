import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [grafikData, setGrafikData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [perbandinganData, setPerbandinganData] = useState([]);

  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    let pemasukan = 0;
    let pengeluaran = 0;
    const dataPerTanggal = {};
    const bulanData = { 1: [], 2: [], 3: [] }; // Untuk data 3 bulan terakhir

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = parseInt(data.amount) || 0;
      const date = data.date || "Tidak diketahui";
      const month = new Date(date).getMonth() + 1; // Mendapatkan bulan dari tanggal

      if (data.type === "Pemasukan") {
        pemasukan += amount;
        if (!dataPerTanggal[date]) dataPerTanggal[date] = { pemasukan: 0, pengeluaran: 0 };
        dataPerTanggal[date].pemasukan += amount;
        if (bulanData[month]) bulanData[month].push(amount); // Menyimpan pemasukan per bulan
      } else if (data.type === "Pengeluaran") {
        pengeluaran += amount;
        if (!dataPerTanggal[date]) dataPerTanggal[date] = { pemasukan: 0, pengeluaran: 0 };
        dataPerTanggal[date].pengeluaran += amount;
        if (bulanData[month]) bulanData[month].push(amount); // Menyimpan pengeluaran per bulan
      }
    });

    setTotalPemasukan(pemasukan);
    setTotalPengeluaran(pengeluaran);
    setSaldo(pemasukan - pengeluaran);

    setGrafikData([
      { name: "Pemasukan", value: pemasukan },
      { name: "Pengeluaran", value: pengeluaran },
    ]);

    const barData = Object.entries(dataPerTanggal).map(([date, values]) => ({
      date,
      pemasukan: values.pemasukan,
      pengeluaran: values.pengeluaran,
    }));

    setBarChartData(barData);

    // Menyusun data untuk perbandingan 3 bulan terakhir
    const perbandingan = Object.keys(bulanData).map((key) => {
      const pemasukanBulan = bulanData[key].reduce((acc, curr) => acc + curr, 0);
      const pengeluaranBulan = bulanData[key].reduce((acc, curr) => acc + curr, 0); // Anggap pengeluaran sama dengan pemasukan
      return {
        bulan: `Bulan ${key}`,
        pemasukan: pemasukanBulan,
        pengeluaran: pengeluaranBulan,
        saldo: pemasukanBulan - pengeluaranBulan,
      };
    });

    setPerbandinganData(perbandingan);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupiah = (angka) =>
    angka.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

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

export default Dashboard;
