import DashboardLayout from "../Layouts/DashboardLayout";
import { useEffect, useState } from "react";
import axios from "axios";

const ParentDashboard = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:8080/api/parent/notifications",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications(res.data);
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Parent Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total Notifikasi" value={notifications.length} />
        <StatCard
          title="Belum Dibaca"
          value={notifications.filter(n => !n.is_read).length}
          color="text-red-500"
        />
        <StatCard title="Status Kehadiran" value="Diperbarui Dosen" />
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Notifikasi Kehadiran</h2>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded border ${
                n.is_read ? "bg-gray-100" : "bg-green-50 border-green-500"
              }`}
            >
              <p>{n.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, color = "text-black" }) => (
  <div className="bg-white p-5 rounded shadow">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default ParentDashboard;
