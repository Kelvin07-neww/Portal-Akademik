const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // belum login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // role belum kebaca (race condition protection)
  if (!role) {
    return null; // atau loading spinner
  }

  // role tidak sesuai
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};
