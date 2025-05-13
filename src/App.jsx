// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Import Toaster
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Transaksi from "./components/Transaksi";
import Laporan from "./components/Laporan";
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";

function AppLayout() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 p-4 md:p-6">
        <Toaster position="top-right" /> {/* Tambahkan Toaster di dalam layout */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/transaksi" element={<PrivateRoute><Transaksi /></PrivateRoute>} />
          <Route path="/laporan" element={<PrivateRoute><Laporan /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
