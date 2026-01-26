import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../Layouts/DashboardLayout";

const Absensi = () => {
  const [absen, setAbsen] = useState([]);

  const token = localStorage.getItem("token");
  const studentID = localStorage.getItem("studentID");

  useEffect(() => {
    axios.get(`http://localhost:8080/api/attendance/${studentID}`, {
      headers: { Authorization: token },
    })
    .then((res) => setAbsen(res.data))
    .catch((err) => console.log(err));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="font-bold text-2xl mb-4">Absensi Mahasiswa</h1>

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full border">
          <thead className="bg-blue-200">
            <tr>
              <th className="p-2 border">Tanggal</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {absen.map((a) => (
              <tr key={a.id}>
                <td className="border p-2">{a.tanggal}</td>
                <td
                  className={`border p-2 font-bold ${
                    a.status === "hadir" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {a.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {absen.length === 0 && (
          <p className="mt-3">Belum ada data absensi.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Absensi;
