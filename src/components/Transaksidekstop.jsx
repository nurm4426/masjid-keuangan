// Transaksi.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

const Transaksi = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("Pemasukan");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // Untuk notifikasi

  const fetchData = async () => {
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filtered = data.filter((tx) => {
      if (!tx.date) return false;
      const [year, month] = tx.date.split("-");
      const matchMonth = selectedMonth ? month === selectedMonth : true;
      const matchYear = selectedYear ? year === selectedYear : true;
      return matchMonth && matchYear;
    });

    setTransaksi(filtered);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleUploadToCloudinary = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "masjid_upload");
    formData.append("folder", "transaksi");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/ddm44tml1/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return null;
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate("");
    setType("Pemasukan");
    setFile(null);
    setFilePreview(null);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseInt(amount) <= 0) {
      alert("Jumlah harus lebih dari 0.");
      return;
    }

    if (!editId) {
      const confirmSave = window.confirm("Simpan transaksi baru?");
      if (!confirmSave) return;
    } else {
      const confirmEdit = window.confirm("Yakin ingin update transaksi ini?");
      if (!confirmEdit) return;
    }

    setLoading(true);

    try {
      const buktiUrl = file ? await handleUploadToCloudinary() : null;

      const data = {
        amount: parseInt(amount),
        description,
        date,
        type,
        createdAt: serverTimestamp(),
      };

      if (buktiUrl) {
        data.buktiUrl = buktiUrl;
      }

      if (editId) {
        const docRef = doc(db, "transactions", editId);
        await updateDoc(docRef, data);
      } else {
        await addDoc(collection(db, "transactions"), data);
      }

      resetForm();
      fetchData();
      setShowSuccess(true); // Tampilkan notifikasi sukses
      setTimeout(() => setShowSuccess(false), 3000); // Sembunyikan otomatis
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Terjadi kesalahan: " + error.message);
    }

    setLoading(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus transaksi ini?")) {
      await deleteDoc(doc(db, "transactions", id));
      fetchData();
    }
  };

  const handleEdit = (tx) => {
    setAmount(tx.amount);
    setDescription(tx.description);
    setDate(tx.date);
    setType(tx.type || "Pemasukan");
    setEditId(tx.id);
    setFile(null);

    if (tx.buktiUrl) {
      setFilePreview(tx.buktiUrl);
    } else {
      setFilePreview(null);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const bulanOptions = [
    { value: "", label: "Semua Bulan" },
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const tahunOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 2020; i--) {
    tahunOptions.push({ value: i.toString(), label: i.toString() });
  }
  tahunOptions.unshift({ value: "", label: "Semua Tahun" });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Tambah Transaksi</h1>

      {showSuccess && (
        <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded mb-4">
          Transaksi berhasil disimpan!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          type="number"
          placeholder="Jumlah"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="Pemasukan">Pemasukan</option>
          <option value="Pengeluaran">Pengeluaran</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {filePreview && (
          <div className="mt-4">
            <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded" />
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Menyimpan..." : editId ? "Update Transaksi" : "Simpan Transaksi"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Reset Form
          </button>
        </div>
      </form>

      <hr className="my-6" />

      <div className="mb-4 flex gap-4 flex-wrap">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded"
        >
          {bulanOptions.map((bulan) => (
            <option key={bulan.value} value={bulan.value}>
              {bulan.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border p-2 rounded"
        >
          {tahunOptions.map((tahun) => (
            <option key={tahun.value} value={tahun.value}>
              {tahun.label}
            </option>
          ))}
        </select>
      </div>

      <h2 className="text-xl font-semibold mb-2">Daftar Transaksi</h2>

      {transaksi.length === 0 ? (
        <p className="text-gray-500 italic">Tidak ada transaksi pada periode ini.</p>
      ) : (
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {transaksi.map((tx) => (
            <div
              key={tx.id}
              className={`min-w-[250px] border-l-4 p-4 rounded shadow flex-shrink-0 ${
                tx.type === "Pemasukan"
                  ? "bg-green-50 border-green-600"
                  : "bg-red-50 border-red-600"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {tx.type === "Pemasukan" ? (
                  <FaArrowDown className="text-green-600" />
                ) : (
                  <FaArrowUp className="text-red-600" />
                )}
                <span className="font-semibold">{tx.type}</span>
              </div>

              <p><strong>Tanggal:</strong> {tx.date}</p>
              <p><strong>Jumlah:</strong> Rp{tx.amount.toLocaleString()}</p>
              <p><strong>Deskripsi:</strong> {tx.description}</p>

              {tx.buktiUrl && (
                <button
                  onClick={() => window.open(tx.buktiUrl, "_blank")}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Lihat Bukti Transaksi
                </button>
              )}

              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handleEdit(tx)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transaksi;
