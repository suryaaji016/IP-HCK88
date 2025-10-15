import { useState, useEffect, useCallback } from "react";
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
      console.log(
        "🔑 Token setelah login:",
        localStorage.getItem("access_token")
      );

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  const handleCredentialResponse = useCallback(
    async (response) => {
      console.log(
        "✅ Google credential:",
        response.credential.slice(0, 30) + "..."
      );
      try {
        const { data } = await axios.post(
          "http://localhost:3001/login/google",
          {
            id_token: response.credential,
          }
        );
        localStorage.setItem("access_token", data.access_token);
        navigate("/");
      } catch (err) {
        console.error("Google login error:", err);
        alert(err.response?.data?.message || "Login Google gagal");
      }
    },
    [navigate]
  );

  useEffect(() => {
    // Load Google Sign-In
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          ux_mode: "popup",
          context: "signin",
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignIn"),
          { theme: "outline", size: "large" }
        );
      }
    };

    // Check if google is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for google script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(checkGoogle);
        }
      }, 100);

      // Cleanup
      return () => clearInterval(checkGoogle);
    }
  }, [handleCredentialResponse]);

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <span className="navbar-logo-icon">🎵</span>
        <span>MusicApp</span>
      </div>

      <h1 className="auth-title">Welcome Back!</h1>
      <p className="auth-subtitle">
        Login untuk mengakses playlist dan fitur menarik lainnya
      </p>

      {/* Email/Password Form */}
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="📧 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="auth-submit-btn">
          {loading ? "⏳ Loading..." : "🎵 Login"}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span className="auth-divider-line"></span>
        <span className="auth-divider-text">or</span>
        <span className="auth-divider-line"></span>
      </div>

      {/* Google Sign-In Button */}
      <div>
        <div id="googleSignIn"></div>
      </div>

      {/* Register Link */}
      <p className="auth-footer">
        Belum punya akun?{" "}
        <Link to="/register" className="auth-link">
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
