const jwt = require("jsonwebtoken");

function generateToken(user) {
  const payload = {
    userid: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
}

module.exports = generateToken;
