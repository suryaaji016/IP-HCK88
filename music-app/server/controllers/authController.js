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
      res.status(201).json({
        id: user.id,
        email: user.email,
        message: "Registration successful",
      });
    } catch (err) {
      console.error("❌ Register error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email & password wajib diisi" });
      }

      const user = await User.findOne({ where: { email } });

      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const access_token = signToken({ id: user.id });
      res.json({ access_token });
    } catch (err) {
      console.error("❌ Login error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async loginGoogle(req, res) {
    try {
      const { id_token } = req.body;

      if (!id_token) {
        return res.status(400).json({ message: "ID token required" });
      }

      console.log("📨 Google login attempt");

      // Verify token
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { email } = ticket.getPayload();
      console.log("✅ Google verified email:", email);

      // Find or create user
      let [user, created] = await User.findOrCreate({
        where: { email },
        defaults: {
          email,
          password: Math.random().toString(36).slice(-8),
        },
      });

      const access_token = signToken({ id: user.id });

      res.status(created ? 201 : 200).json({
        message: "Login Google sukses",
        access_token,
      });
    } catch (err) {
      console.error("❌ Google login error:", err);
      res.status(401).json({ message: "Token Google tidak valid" });
    }
  }
}

module.exports = AuthController;
