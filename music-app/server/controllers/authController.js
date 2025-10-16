const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  static async register(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email & password wajib diisi" });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      const user = await User.create({ email, password });

      return res.status(201).json({
        message: "Registration successful",
        user: { id: user.id, email: user.email },
      });
    } catch (err) {
      console.error("❌ Register error:", err);

      if (err.name === "SequelizeValidationError") {
        return res.status(400).json({ message: err.errors[0].message });
      }

      return res.status(500).json({ message: err.message });
    }
  }

  static async login(req, res) {
    try {
      console.log("🔐 POST /login called");
      console.log("📦 Request body:", {
        email: req.body.email,
        password: "***",
      });

      const { email, password } = req.body;

      if (!email || !password) {
        console.log("❌ Missing email or password");
        return res
          .status(400)
          .json({ message: "Email & password wajib diisi" });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        console.log("❌ User not found:", email);
        return res.status(400).json({ message: "Email atau password salah" });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        console.log("❌ Invalid password for:", email);
        return res.status(400).json({ message: "Email atau password salah" });
      }

      const access_token = signToken({ id: user.id });
      console.log("✅ Login successful for:", email);

      return res.status(200).json({ access_token });
    } catch (err) {
      console.error("❌ Login error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async loginGoogle(req, res) {
    try {
      console.log("🔐 POST /login/google called");
      const { id_token } = req.body;

      if (!id_token) {
        console.log("❌ Missing id_token");
        return res.status(400).json({ message: "ID token required" });
      }

      console.log("📨 Verifying Google token...");
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { email } = ticket.getPayload();
      console.log("✅ Google verified email:", email);

      const [user, created] = await User.findOrCreate({
        where: { email },
        defaults: { email, password: Math.random().toString(36).slice(-8) },
      });

      const access_token = signToken({ id: user.id });
      console.log(
        "✅ Google login successful:",
        email,
        created ? "(new user)" : "(existing)"
      );

      return res.status(created ? 201 : 200).json({
        message: "Login Google sukses",
        access_token,
      });
    } catch (err) {
      console.error("❌ Google login error:", err);
      console.error("❌ Error details:", err.message);
      return res.status(401).json({ message: "Token Google tidak valid" });
    }
  }
}

module.exports = AuthController;
