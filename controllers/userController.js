const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");
const sendVerification = require("../utils/emailVerification");
const generateToken = require("../utils/generateToken");


exports.registerUser = async (req, res) => {
  let {
    firstname,
    lastname,
    email,
    phone,
    address,
    password,
    confirmpassword,
  } = req.body;

  // Trim strings to remove leading/trailing spaces
  firstname = firstname?.trim();
  lastname = lastname?.trim();
  email = email?.trim();
  phone = phone?.trim();
  address = address?.trim();

  console.log("reqbody:", req.body);

  try {
    if (!firstname) {
      return res
        .status(400)
        .json({ success: false, message: "First name is required!" });
    }
    if (!lastname) {
      return res
        .status(400)
        .json({ success: false, message: "Last name is required!" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email field!" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Missing phone number field!" });
    }
    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing address field!" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing password field!" });
    }
    if (!confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: "Missing confirm password field!" });
    }

    // Validate email format after trimming
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format!" });
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
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match!",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "Users");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists!",
      });
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
      },
    });

    if (!newUser) {
      return res.status(400).json({
        success: true,
        message: "User creation failed!",
        data: newUser,
      });
    }

    const verificationLink = "https://granduer-steel.vercel.app/";
    try {
      await sendVerification(newUser.email, verificationLink);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email.",
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "User created successfully! Please check your email to verify your account.",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again later!",
      error: error.message,
    });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email Field is not provided" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password Field is not provided" });
    }

    // ✅ FIXED: Only pass email string, not an object
    const user = await prisma.user.findUnique({
      where: { email }, // This should be: { email: "delightgeorge105@gmail.com" }
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      return res
        .status(401)
        .json({ success: false, message: "Password is incorrect!" });
    }
    
    const token = generateToken(user);
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "invalid or no token!",
      });
    }

    res.setHeader("Authorization", `Bearer ${token}`);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");

    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.log("error", error.message);

    return res.status(500).json({
      success: false,
      message: "internal server error please try later!",
    });
  }
};

exports.updateUserController = async (req, res) => {
  try {
    const userUuid = req.user.uuid; // comes from JWT
    if (!userUuid) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { firstName, lastName, email, phone, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { uuid: userUuid }, // use uuid
      data: {
        firstname: firstName,
        lastname: lastName,
        email,
        phone,
        address,
      },
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





