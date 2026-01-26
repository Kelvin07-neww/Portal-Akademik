import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../Layouts/DashboardLayout";
import { useLocation } from "react-router-dom";

const API = "http://localhost:8080/api"; // 🔥 SAMAKAN PORT BACKEND DI SINI

const LecturerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [activeTab, setActiveTab] = useState("courses");

  const token = localStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("attendance")) setActiveTab("attendance");
    else if (location.pathname.includes("grades")) setActiveTab("grades");
    else setActiveTab("courses");
  }, [location.pathname]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // ================= COURSES =================
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/lecturer/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("COURSES DARI BACKEND:", res.data);

      // 🔥 Pastikan selalu array
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchStudents(course.id);
    fetchAttendance(course.id);
    fetchGrades(course.id);
  };

  // ================= STUDENTS =================
  const fetchStudents = async (courseId) => {
    try {
      const res = await axios.get(`${API}/lecturer/students?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  // ================= ATTENDANCE =================
  const fetchAttendance = async (courseId) => {
    try {
      const res = await axios.get(`${API}/lecturer/attendance?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendance([]);
    }
  };

  // ================= GRADES =================
  const fetchGrades = async (courseId) => {
    try {
      const res = await axios.get(`${API}/lecturer/grades?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrades(res.data || []);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setGrades([]);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Lecturer Dashboard</h1>

        {/* ================= COURSES ================= */}
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses assigned to this lecturer.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                className={`p-4 border rounded cursor-pointer ${
                  selectedCourse?.id === course.id
                    ? "bg-blue-100 border-blue-500"
                    : "bg-white"
                }`}
              >
                <h3 className="font-semibold">{course.name}</h3>
                <p className="text-sm text-gray-600">{course.code}</p>
              </div>
            ))}
          </div>
        )}

        {/* ================= DETAIL COURSE ================= */}
        {selectedCourse && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">{selectedCourse.name}</h2>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setActiveTab("attendance")}
                className={`px-4 py-2 rounded ${
                  activeTab === "attendance"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab("grades")}
                className={`px-4 py-2 rounded ${
                  activeTab === "grades"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Grades
              </button>
            </div>

            {/* ================= ATTENDANCE ================= */}
            {activeTab === "attendance" && (
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border p-2">Student</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center p-4">
                        No attendance data
                      </td>
                    </tr>
                  ) : (
                    attendance.map((a) => (
                      <tr key={a.id}>
                        <td className="border p-2">{a.student_name}</td>
                        <td className="border p-2">{a.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* ================= GRADES ================= */}
            {activeTab === "grades" && (
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border p-2">Student</th>
                    <th className="border p-2">Type</th>
                    <th className="border p-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center p-4">
                        No grades data
                      </td>
                    </tr>
                  ) : (
                    grades.map((g) => (
                      <tr key={g.id}>
                        <td className="border p-2">{g.student_name}</td>
                        <td className="border p-2">{g.grade_type}</td>
                        <td className="border p-2">{g.score}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LecturerDashboard;
