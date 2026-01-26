import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const Navbar = ({ toggleSidebar }) => {
  const [unread, setUnread] = useState(0);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role === "parent") {
      fetchUnread();
    }
  }, [role]);

  const fetchUnread = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/parent/notifications/unread-count",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnread(res.data.count || 0);
    } catch (err) {
      console.log("Bukan parent / notif tidak tersedia");
      setUnread(0);
    }
  };

  return (
    <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center shadow">
      <div className="flex items-center gap-3">
        {toggleSidebar && (
          <Menu
            className="cursor-pointer"
            onClick={toggleSidebar}
          />
        )}

        <h1 className="text-lg text-black font-serif font-bold">
          {role === "lecturer"
            ? "Lecturer Dashboard"
            : role === "parent"
            ? "Parent Dashboard"
            : role === "admin"
            ? "Admin Dashboard"
            : "Dashboard"}
        </h1>
      </div>

      {role === "parent" && (
        <div className="relative">
          <Bell />
          {unread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 rounded-full">
              {unread}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
