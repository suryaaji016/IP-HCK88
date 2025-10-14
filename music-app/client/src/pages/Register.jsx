import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("http://localhost:3001/register", { email, password });
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
      <h1 className="home-title">📝 Register</h1>
      <form onSubmit={handleRegister} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "⏳ Loading..." : "Register"}
        </button>
        <p>
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
