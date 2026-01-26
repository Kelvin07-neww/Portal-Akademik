import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../Layouts/DashboardLayout";

const AcademicDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [enrollmentModal, setEnrollmentModal] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    nim: "",
    major: "",
    semester: 1,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      Swal.fire("Error", "Gagal memuat data mahasiswa", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        // Update student
        await axios.put("http://localhost:8080/api/admin/students", {
          id: editingStudent.id,
          name: formData.name,
          nim: formData.nim,
          major: formData.major,
          semester: formData.semester,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire("Berhasil", "Data mahasiswa berhasil diupdate", "success");
      } else {
        // Create new student
        await axios.post("http://localhost:8080/api/admin/students", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire("Berhasil", "Mahasiswa baru berhasil ditambahkan", "success");
      }

      fetchStudents();
      resetForm();
    } catch (error) {
      console.error("Error saving student:", error);
      Swal.fire("Error", "Gagal menyimpan data mahasiswa", "error");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      email: "",
      password: "",
      name: student.name,
      nim: student.nim,
      major: "",
      semester: 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (studentId) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data mahasiswa akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete("http://localhost:8080/api/admin/students", {
          data: { id: studentId },
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire("Terhapus!", "Data mahasiswa telah dihapus.", "success");
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire("Error", "Gagal menghapus data mahasiswa", "error");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      nim: "",
      major: "",
      semester: 1,
    });
    setEditingStudent(null);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Mahasiswa</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? "Batal" : "+ Tambah Mahasiswa"}
          </button>
        </div>

        {/* Form Tambah/Edit Mahasiswa */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingStudent ? "Edit Mahasiswa" : "Tambah Mahasiswa Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editingStudent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!editingStudent}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIM
                </label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({...formData, nim: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jurusan
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Teknik Informatika"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingStudent ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel Daftar Mahasiswa */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Mahasiswa</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.nim}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEnrollmentModal(student)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Daftar Kursus
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {students.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data mahasiswa
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enrollment Modal */}
        {enrollmentModal && (
          <EnrollmentModal
            student={enrollmentModal}
            onClose={() => setEnrollmentModal(null)}
            token={token}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Enrollment Modal Component
const EnrollmentModal = ({ student, onClose, token }) => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("EnrollmentModal opened for student:", student);
    if (!student || !student.id) {
      console.error("Invalid student object:", student);
      setError("Data mahasiswa tidak valid");
      setLoading(false);
      return;
    }
    fetchCourses();
    fetchEnrollments();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses...");
      const response = await axios.get("http://localhost:8080/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Courses response:", response.data);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  const fetchEnrollments = async () => {
    try {
      console.log("Fetching enrollments for student:", student.id);
      const response = await axios.get(`http://localhost:8080/api/admin/enrollments?student_id=${student.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Enrollments response:", response.data);
      setEnrollments(response.data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post("http://localhost:8080/api/admin/enroll", {
        student_id: student.id,
        course_id: courseId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Berhasil", "Mahasiswa berhasil didaftarkan ke mata kuliah", "success");
      fetchEnrollments();
    } catch (error) {
      console.error("Error enrolling student:", error);
      Swal.fire("Error", "Gagal mendaftarkan mahasiswa", "error");
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await axios.post("http://localhost:8080/api/admin/unenroll", {
        student_id: student.id,
        course_id: courseId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Berhasil", "Mahasiswa berhasil dihapus dari mata kuliah", "success");
      fetchEnrollments();
    } catch (error) {
      console.error("Error unenrolling student:", error);
      Swal.fire("Error", "Gagal menghapus pendaftaran mahasiswa", "error");
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.course_id === courseId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Kelola Pendaftaran - {student.name} ({student.nim})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Mata Kuliah Tersedia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{course.name}</h4>
                        <p className="text-sm text-gray-600">{course.code}</p>
                        <p className="text-sm text-gray-500">Dosen: {course.lecturer_name}</p>
                      </div>
                      <div>
                        {isEnrolled(course.id) ? (
                          <button
                            onClick={() => handleUnenroll(course.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Hapus
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Daftar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {courses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada mata kuliah tersedia
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicDashboard;
