import { useState } from "react";
import { Menu, X, Home, DollarSign, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoMasjid from "../assets/logo.png"; // pastikan file ini ada

const SidebarMobile = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { to: "/transaksi", label: "Transaksi", icon: <DollarSign className="w-5 h-5" /> },
    { to: "/laporan", label: "Laporan", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="relative z-50">
      {/* Tombol buka sidebar */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-md shadow-md"
      >
        <Menu />
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar geser */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <img
            src={logoMasjid}
            alt="Logo Masjid"
            className="w-10 h-10 rounded-full bg-white p-1 shadow"
          />
          <h2 className="text-base font-bold uppercase text-green-900 leading-tight">
            KEUANGAN MASJID <br /> AL-IHSAN
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto text-gray-600"
          >
            <X />
          </button>
        </div>

        {/* Menu */}
        <ul className="p-4 space-y-3">
          {menuItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-150 ${
                  location.pathname === item.to
                    ? "bg-green-100 text-green-700 font-semibold"
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
    </div>
  );
};

export default SidebarMobile;
