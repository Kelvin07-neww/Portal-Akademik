import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../Layouts/DashboardLayout";

const KRS = () => {
  const [courses, setCourses] = useState([]);
  const [myKRS, setMyKRS] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:8080/api/courses", {
      headers: { Authorization: token },
    }).then((res) => setCourses(res.data));

    axios.get("http://localhost:8080/api/krs", {
      headers: { Authorization: token },
    }).then((res) => setMyKRS(res.data));
  }, []);

  const addToKRS = (courseID) => {
    axios.post(
      "http://localhost:8080/api/krs/add",
      { course_id: courseID },
      { headers: { Authorization: token } }
    ).then(() => {
      alert("Berhasil ambil mata kuliah!");
      window.location.reload();
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="font-bold text-2xl mb-4">Kartu Rencana Studi (KRS)</h1>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Daftar Mata Kuliah</h2>

          {courses.length === 0 ? (
            <p>Tidak ada mata kuliah.</p>
          ) : (
            <table className="w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Kode</th>
                  <th className="p-2 border">Mata Kuliah</th>
                  <th className="p-2 border">SKS</th>
                  <th className="p-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="border p-2">{c.code}</td>
                    <td className="border p-2">{c.name}</td>
                    <td className="border p-2">{c.sks}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => addToKRS(c.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Ambil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* KRS yang sudah diambil */}
        <div className="bg-white p-4 rounded shadow mt-6">
          <h2 className="text-lg font-semibold mb-2">KRS Saya</h2>

          {myKRS.length === 0 ? (
            <p>Belum ambil mata kuliah.</p>
          ) : (
            <table className="w-full border">
              <thead className="bg-green-200">
                <tr>
                  <th className="p-2 border">Kode</th>
                  <th className="p-2 border">Mata Kuliah</th>
                  <th className="p-2 border">SKS</th>
                </tr>
              </thead>
              <tbody>
                {myKRS.map((c) => (
                  <tr key={c.id}>
                    <td className="border p-2">{c.code}</td>
                    <td className="border p-2">{c.name}</td>
                    <td className="border p-2">{c.sks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KRS;
