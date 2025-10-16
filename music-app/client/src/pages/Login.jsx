import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../store/slices/authSlice";
import authAPI from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("🔄 Attempting login with email:", email);

      const data = await authAPI.login({ email, password });
      console.log("✅ Login successful, token received");

      localStorage.setItem("access_token", data.access_token);
      dispatch(setToken(data.access_token));

      console.log("✅ Token saved, navigating to home");
      navigate("/");
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("❌ Error response:", err.response?.data);
      alert(
        err.response?.data?.message || "Login gagal. Cek email dan password."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        console.log("🔄 Attempting Google login");

        const data = await authAPI.googleLogin({
          id_token: response.credential,
        });

        console.log("✅ Google login successful");
        localStorage.setItem("access_token", data.access_token);
        dispatch(setToken(data.access_token));

        console.log("✅ Token saved, navigating to home");
        navigate("/");
      } catch (err) {
        console.error("❌ Google login error:", err);
        console.error("❌ Error response:", err.response?.data);
        alert(err.response?.data?.message || "Login Google gagal");
      }
    },
    [navigate, dispatch]
  );

  useEffect(() => {
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

    if (window.google) {
      initializeGoogleSignIn();
    } else {
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
