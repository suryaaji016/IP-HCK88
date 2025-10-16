import { useState } from "react";
import { useNavigate, Link } from "react-router";
import authAPI from "../api/auth";
import Swal from "sweetalert2";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.register({ email, password });
      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil!",
        text: "Silakan login untuk melanjutkan.",
        background: "#121212",
        color: "#fff",
        confirmButtonColor: "#1db954",
        confirmButtonText: "Login Sekarang",
      }).then(() => {
        navigate("/login");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registrasi Gagal",
        text: err.response?.data?.message || "Gagal register",
        background: "#121212",
        color: "#fff",
        confirmButtonColor: "#1db954",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <span className="navbar-logo-icon">
          <img src="/logo.png" alt="Logo" />
        </span>
        <span>Spotipy</span>
      </div>

      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">
        Daftar untuk mulai menggunakan MusicApp dan nikmati fitur menarik!
      </p>

      <form onSubmit={handleRegister} className="auth-form">
        <input
          type="email"
          placeholder="📧 Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="🔒 Password (min. 5 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={5}
        />
        <button type="submit" disabled={loading} className="auth-submit-btn">
          {loading ? "⏳ Creating Account..." : "🎵 Register Now"}
        </button>
      </form>

      <p className="auth-footer">
        Sudah punya akun?{" "}
        <Link to="/login" className="auth-link">
          Login Sekarang
        </Link>
      </p>
    </div>
  );
}
