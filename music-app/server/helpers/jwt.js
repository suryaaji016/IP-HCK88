const jwt = require("jsonwebtoken");

module.exports = {
  signToken: (data) => jwt.sign(data, "surya"),
  verifyToken: (token) => jwt.verify(token, "surya"),
};
