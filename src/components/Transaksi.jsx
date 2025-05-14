// Transaksi.jsx
import React, { useEffect, useState } from "react";
import Transaksidekstop from "./Transaksidekstop";
import Transaksimobile from "./Transaksimobile";

const Transaksi = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fungsi untuk mengecek apakah lebar layar < 768px (mobile)
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Cek saat pertama kali
    checkScreenSize();

    // Update saat jendela di-resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup event listener saat komponen unmount
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return isMobile ? <Transaksimobile /> : <Transaksidekstop />;
};

export default Transaksi;
