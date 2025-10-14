const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

async function authentication(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) throw { name: "Unauthorized" };

    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    const user = await User.findByPk(payload.id);
    if (!user) throw { name: "Unauthorized" };

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or missing token" });
  }
}

module.exports = authentication;
