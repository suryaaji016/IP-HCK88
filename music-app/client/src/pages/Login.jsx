import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });
      localStorage.setItem("access_token", data.access_token);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h1 className="home-title">🔐 Login</h1>
      <form onSubmit={handleLogin} className="auth-form">
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
          {loading ? "⏳ Loading..." : "Login"}
        </button>
        <p>
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>
      </form>
    </div>
  );
}
