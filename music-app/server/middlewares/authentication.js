const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

async function authentication(req, res, next) {
  try {
    console.log(
      "🔐 Authentication middleware called for:",
      req.method,
      req.path
    );

    const header = req.headers.authorization;
    console.log("📨 Authorization header:", header ? "EXISTS" : "MISSING");

    if (!header) throw { name: "Unauthorized" };

    const token = header.split(" ")[1];
    console.log("🎫 Token extracted:", token ? "YES" : "NO");

    const payload = verifyToken(token);
    console.log("✅ Token verified, user ID:", payload.id);

    const user = await User.findByPk(payload.id);
    if (!user) throw { name: "Unauthorized" };

    req.user = { id: user.id, email: user.email };
    console.log("👤 User attached to request:", user.email);

    next();
  } catch (err) {
    console.error("❌ Authentication failed:", err.message || err.name);
    res.status(401).json({ message: "Invalid or missing token" });
  }
}

module.exports = authentication;
