// ✅ versi yang dijamin jalan di react-router (tanpa dom)
import { Navigate } from "react-router";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.log("🚫 Belum login, redirect ke /login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Sudah login, tampilkan halaman");
  return children;
}
