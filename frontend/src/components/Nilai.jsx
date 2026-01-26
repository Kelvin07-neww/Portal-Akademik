import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../Layouts/DashboardLayout";

const Nilai = () => {
  const [grades, setGrades] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/grades", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGrades(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="font-bold text-2xl mb-4">Kartu Hasil Studi (KHS)</h1>

      <div className="bg-white p-4 rounded shadow">
        {grades.length === 0 ? (
          <p>Belum ada nilai.</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-300">
              <tr>
                <th className="p-2 border">Mata Kuliah</th>
                <th className="p-2 border">SKS</th>
                <th className="p-2 border">Nilai</th>
                <th className="p-2 border">Bobot</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td className="border p-2">{g.course_name}</td>
                  <td className="border p-2">{g.sks}</td>
                  <td className="border p-2">{g.score}</td>
                  <td className="border p-2">{g.bobot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Nilai;
