import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../Layouts/DashboardLayout";

const LecturerGrades = () => {
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

  const initGrades = async () => {
    if (!selectedCourse) return alert("Select course");

    const data = students.map((s) => ({
      student_id: s.id,
      course_id: selectedCourse.id,
      grade_type: "uts",
      score: 0,
    }));

    try {
      await axios.post(
        "http://localhost:8081/api/lecturer/grades",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Grades initialized!");
    } catch (err) {
      console.error(err);
      alert("Failed to init grades");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Grades</h1>

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

        <button
          className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          onClick={initGrades}
        >
          Initialize Grades
        </button>

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

export default LecturerGrades;
