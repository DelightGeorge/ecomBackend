const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function generateToken(user) {
  try {
    const { firstname, lastname, email, phone, address, image, role, id, uuid } = user;

    if (!firstname || !lastname || !email || !phone || !address || !id || !uuid) {
      throw new Error("Missing required user field for token generation!");
    }

    const payload = {
      firstname,
      lastname,
      email,
      phone,
      address,
      image,
      role,
      id,
      uuid, // <- make sure uuid is included
    };

    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw error;
  }
}

module.exports = generateToken;
