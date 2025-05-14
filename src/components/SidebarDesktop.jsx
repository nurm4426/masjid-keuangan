// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { Home, DollarSign, FileText } from "lucide-react";
import logoMasjid from "../assets/logo.png"; // pastikan file ini ada

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { to: "/transaksi", label: "Transaksi", icon: <DollarSign className="w-5 h-5" /> },
    { to: "/laporan", label: "Laporan", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-white to-green-600 text-gray-800 p-5 border-r border-gray-200">
      {/* Logo dan Judul */}
      <div className="flex items-center gap-3 mb-8">
        <img src={logoMasjid} alt="Logo Masjid" className="w-10 h-10 rounded-full bg-white p-1 shadow" />
        <h2 className="text-lg font-bold uppercase text-green-900 leading-tight">
          KEUANGAN MASJID <br /> AL-IHSAN
        </h2>
      </div>

      {/* Menu */}
      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-150 ${
                location.pathname === item.to
                  ? "bg-white text-green-700 font-semibold"
                  : "text-gray-800 hover:bg-green-100 hover:text-green-900"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
