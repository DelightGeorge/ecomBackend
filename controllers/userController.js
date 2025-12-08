const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { sendVerification } = require("../utils/emailVerification");
const generateToken = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, phone, address, password, confirmpassword } = req.body
  try {
    if (!firstname) {
      return res.status(400).json({ success: false, message: "First name is required!" })
    }
    if (!lastname) {
      return res.status(400).json({ success: false, message: "Last name is required!" })
    }
    if (!email) {
      return res.status(400).json({ success: false, message: "Missing email field!" })
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: "Missing phone number field!" })
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Missing address field!" })
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Missing password field!" })
    }
    if (!confirmpassword) {
      return res.status(400).json({ success: false, message: "Missing confirm password field!" })
    }


    //validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format!" });
    }



    // Validate password (must start with uppercase and include a special character)
    const passwordRegex = /^[A-Z](?=.*[\W_])/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must start with an uppercase letter and include at least one special character.",
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ success: false, message: "Password and confirm password do not match!" });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "Users");
    }

    //check if user already exists

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists!" });
    }

    const newUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        address,
        password: hashedPassword,
        image: imageUrl || null,
      }
    });
    if (!newUser) {
      return res.status(400).json({ success: true, message: "User creation failed!", data: newUser });
    }

    const verificationLink = "https://www.google.com/";
    await sendVerification(newUser.email, verificationLink);

    return res.status(201).json({ success: true, message: "User created successfully!", data: newUser });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error, please try again later!", error: error.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email) {
      return res.status(400).json({ success: false, message: "Email field is required!" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password field is required!" });
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: "User with this email does not exist!" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Incorrect password!" });
    }

    // Ensure required fields exist for token
    const requiredFields = ["firstname", "lastname", "email", "phone", "address", "id", "uuid"];
    const missingFields = requiredFields.filter(field => !user[field]);
    if (missingFields.length > 0) {
      console.error("Missing fields for token generation:", missingFields);
      return res.status(500).json({
        success: false,
        message: `Cannot generate token, missing user fields: ${missingFields.join(", ")}`
      });
    }

    // Generate token
    let token;
    try {
      token = generateToken(user);
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      return res.status(500).json({ success: false, message: "Error generating authentication token" });
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later!",
      error: error.message
    });
  }
};
