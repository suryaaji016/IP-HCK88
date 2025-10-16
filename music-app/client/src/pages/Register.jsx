import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authAPI from "../api/auth";

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
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <span className="navbar-logo-icon">🎵</span>
        <span>MusicApp</span>
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
          required
        />
        <input
          type="password"
          placeholder="🔒 Password (min. 5 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
