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

  try {
    firstname = firstname?.trim();
    lastname  = lastname?.trim();
    email     = email?.trim();
    phone     = phone?.trim();
    address   = address?.trim();

    // Validation
    if (!firstname || !lastname || !email || !phone || !address || !password)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    if (!confirmpassword)
      return res.status(400).json({ success: false, message: "Confirm password is required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ success: false, message: "Invalid email format" });

    const passwordRegex = /^[A-Z](?=.*[\W_])/;
    if (!passwordRegex.test(password))
      return res.status(400).json({
        success: false,
        message: "Password must start with uppercase and contain a special character",
      });

    if (password !== confirmpassword)
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing)
      return res.status(400).json({ success: false, message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Upload image if provided
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "Users");
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        address,
        password: hashedPassword,
        image: imageUrl,
      },
    });

    // Send verification email
    try {
      await sendVerification(newUser.email, "https://granduer-steel.vercel.app/");
    } catch (err) {
      console.log("Email error:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please verify your email.",
      data: newUser,
    });
  } catch (error) {
    console.log("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================================ LOGIN ================================

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });

    const token = generateToken(user);

    res.setHeader("Authorization", `Bearer ${token}`);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};