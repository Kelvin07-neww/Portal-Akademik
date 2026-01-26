import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Dashboard content */}
        <main className="p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Selamat Datang 👋</h2>
          <p className="text-gray-600">
            Ini adalah tampilan dashboard utama. Kamu bisa mengakses KRS, Jadwal Kuliah,
            Jadwal Ujian, dan Profil dari menu di sebelah kiri.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition">
              <h3 className="font-semibold text-gray-800 mb-2">Total SKS</h3>
              <p className="text-blue-700 text-2xl font-bold">24</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition">
              <h3 className="font-semibold text-gray-800 mb-2">Kehadiran</h3>
              <p className="text-blue-700 text-2xl font-bold">92%</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition">
              <h3 className="font-semibold text-gray-800 mb-2">Nilai Rata-rata</h3>
              <p className="text-blue-700 text-2xl font-bold">3.75</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
