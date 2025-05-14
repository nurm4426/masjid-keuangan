// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import DashboardDesktop from "./DashboardDesktop";
import DashboardMobile from "./DashboardMobile";

const Dashboard = () => {
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [grafikData, setGrafikData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [perbandinganData, setPerbandinganData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

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
    const checkIfMobile = window.innerWidth <= 768;
    setIsMobile(checkIfMobile);
  }, []);

  return (
    <div>
      {isMobile ? (
        <DashboardMobile
          totalPemasukan={totalPemasukan}
          totalPengeluaran={totalPengeluaran}
          saldo={saldo}
          grafikData={grafikData}
          barChartData={barChartData}
          perbandinganData={perbandinganData}
        />
      ) : (
        <DashboardDesktop
          totalPemasukan={totalPemasukan}
          totalPengeluaran={totalPengeluaran}
          saldo={saldo}
          grafikData={grafikData}
          barChartData={barChartData}
          perbandinganData={perbandinganData}
        />
      )}
    </div>
  );
};

export default Dashboard;
