const bcrypt = require("bcryptjs");

module.exports = {
  hashPassword: (password) => bcrypt.hashSync(password),
  comparePassword: (password, hashedPassword) =>
    bcrypt.compare(password, hashedPassword),
};
