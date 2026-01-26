import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LecturerDashboard from "./pages/LecturerDashboard.jsx";
import LecturerAttendance from "./components/LecturerAttendance.jsx";
import LecturerGrades from "./components/LecturerGrades.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import AcademicDashboard from "./pages/AcademicDashboard.jsx";

import KRS from "./components/KRS.jsx";
import Nilai from "./components/Nilai.jsx";
import Absensi from "./components/Absensi.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (!role) return null;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* STUDENT */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* LECTURER */}
        <Route
          path="/lecturer"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/attendance"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/grades"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerGrades />
            </ProtectedRoute>
          }
        />

        {/* PARENT */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ACADEMIC / ADMIN */}
        <Route
          path="/academic"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AcademicDashboard />
            </ProtectedRoute>
          }
        />

        {/* STUDENT MENU */}
        <Route
          path="/krs"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <KRS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nilai"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Nilai />
            </ProtectedRoute>
          }
        />
        <Route
          path="/absensi"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Absensi />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
