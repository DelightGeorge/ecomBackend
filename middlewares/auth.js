const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Middleware to verify user token
exports.isUser = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

// Middleware to allow only Admin users
exports.isAdmin = (req, res, next) => {
  if (req.user?.role === "ADMIN") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Forbidden route. Only Admins can access this route",
  });
};

// Middleware to check if the authenticated user matches the requested user
exports.isSameUser = (req, res, next) => {
  const { uuid } = req.params;
  if (req.user?.uuid !== uuid) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. This is not your profile",
    });
  }
  return next();
};
