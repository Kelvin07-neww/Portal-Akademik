import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  User,
  Settings,
  LogOut,
  MenuSquareIcon,
  Calendar,
  CheckSquare,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // 🔐 Ambil role dari token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
      } catch {
        console.error("Token tidak valid");
      }
    }
  }, []);

  const toggleSubMenu = (menu) => {
    setOpenSubMenu(openSubMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin keluar?",
      text: "Sesi login Anda akan berakhir.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, keluar",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/login");
      }
    });
  };

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-green-600 text-white flex flex-col transition-[width] duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-green-500">
        {isOpen && <h2 className="font-bold text-lg">Portal Akademik</h2>}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-green-700 rounded"
        >
          <MenuSquareIcon size={20} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4 space-y-1">

        {/* STUDENT */}
        {role === "student" && (
          <>
            <MenuItem icon={<Home size={20} />} label="Dashboard" open={isOpen}
              active={isActive("/dashboard")}
              onClick={() => navigate("/dashboard")} />

            <MenuItem icon={<BookOpen size={20} />} label="KRS" open={isOpen}
              active={isActive("/krs")}
              onClick={() => navigate("/krs")} />

            <MenuItem icon={<FileCheck size={20} />} label="Nilai" open={isOpen}
              active={isActive("/nilai")}
              onClick={() => navigate("/nilai")} />

            <MenuItem icon={<CheckSquare size={20} />} label="Absensi" open={isOpen}
              active={isActive("/absensi")}
              onClick={() => navigate("/absensi")} />
          </>
        )}

        {/* LECTURER */}
        {role === "lecturer" && (
          <>
            <MenuItem icon={<Home size={20} />} label="Dashboard" open={isOpen}
              active={isActive("/lecturer")}
              onClick={() => navigate("/lecturer")} />

            <MenuItem icon={<CheckSquare size={20} />} label="Absensi" open={isOpen}
              active={isActive("/lecturer/attendance")}
              onClick={() => navigate("/lecturer/attendance")} />

            <MenuItem icon={<FileCheck size={20} />} label="Nilai" open={isOpen}
              active={isActive("/lecturer/grades")}
              onClick={() => navigate("/lecturer/grades")} />
          </>
        )}

        {/* ADMIN */}
        {role === "admin" && (
          <MenuItem icon={<User size={20} />} label="Manajemen Mahasiswa" open={isOpen}
            active={isActive("/academic")}
            onClick={() => navigate("/academic")} />
        )}

        {/* Jadwal */}
        {(role === "student" || role === "lecturer") && (
          <>
            <button
              onClick={() => toggleSubMenu("jadwal")}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-green-800 rounded"
            >
              <div className="flex items-center">
                <Calendar size={20} />
                {isOpen && <span className="ml-3">Jadwal</span>}
              </div>
              {isOpen && (
                <motion.div
                  animate={{ rotate: openSubMenu === "jadwal" ? 180 : 0 }}
                >
                  <ChevronDown size={18} />
                </motion.div>
              )}
            </button>

            <AnimatePresence>
              {openSubMenu === "jadwal" && isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-10 space-y-1"
                >
                  <SubMenuItem label="Jadwal Kuliah"
                    onClick={() => navigate("/jadwal-kuliah")} />
                  <SubMenuItem label="Jadwal Ujian"
                    onClick={() => navigate("/jadwal-ujian")} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <MenuItem icon={<Settings size={20} />} label="Pengaturan" open={isOpen}
          active={isActive("/pengaturan")}
          onClick={() => navigate("/pengaturan")} />

        <MenuItem icon={<User size={20} />} label="Profil" open={isOpen}
          active={isActive("/profil")}
          onClick={() => navigate("/profil")} />
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full hover:bg-red-600 px-2 py-2 rounded"
        >
          <LogOut size={20} />
          {isOpen && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

/* ========= COMPONENT KECIL ========= */

const MenuItem = ({ icon, label, open, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2 rounded
      ${active ? "bg-green-800" : "hover:bg-green-700"}`}
  >
    {icon}
    {open && <span className="ml-3">{label}</span>}
  </button>
);

const SubMenuItem = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="block w-full text-left text-sm hover:bg-green-800 px-2 py-1 rounded"
  >
    {label}
  </button>
);

export default Sidebar;
