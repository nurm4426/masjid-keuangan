// src/components/Laporan.jsx
import React, { useEffect, useState } from "react";
import Laporandekstop from "./Laporandekstop";
import Laporanmobile from "./Laporanmobile";

const Laporan = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fungsi untuk mengecek lebar layar
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // <=768px dianggap sebagai mobile
    };

    // Cek saat pertama kali komponen di-mount
    handleResize();

    // Pasang event listener untuk perubahan ukuran layar
    window.addEventListener("resize", handleResize);

    // Bersihkan event listener saat komponen di-unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <Laporanmobile /> : <Laporandekstop />;
};

export default Laporan;
