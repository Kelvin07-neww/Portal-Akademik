import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../Layouts/DashboardLayout";

const LecturerAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8081/api/lecturer/courses",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (courseId) => {
    try {
      const res = await axios.get(
        `http://localhost:8081/api/lecturer/students?course_id=${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAttendance = async () => {
    const date = document.getElementById("attendanceDate").value;
    if (!date || !selectedCourse) return alert("Select course & date");

    const data = students.map((s) => ({
      student_id: s.id,
      course_id: selectedCourse.id,
      date,
      status: "present",
    }));

    try {
      await axios.post(
        "http://localhost:8081/api/lecturer/attendance",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Attendance saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Attendance</h1>

        <select
          className="border p-2 mb-4"
          onChange={(e) => {
            const course = courses.find(
              (c) => c.id === Number(e.target.value)
            );
            setSelectedCourse(course);
            fetchStudents(course.id);
          }}
        >
          <option>Select Course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="mb-4">
          <input
            type="date"
            id="attendanceDate"
            className="border p-2 mr-2"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={markAttendance}
          >
            Mark All Present
          </button>
        </div>

        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Student</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="border p-2">{s.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default LecturerAttendance;
