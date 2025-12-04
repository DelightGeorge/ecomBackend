// controllers/paymentController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Payment
exports.initializePayment = async (req, res) => {
  try {
    const user = req.user;
    const order_id = uuidv4();

    const userCart = await prisma.cart.findUnique({
      where: { userid: user.id },
      include: { Productcart: { include: { product: true } } },
    });

    if (!userCart || !userCart.Productcart.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const totalPrice = userCart.Productcart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    const payload = {
      tx_ref: order_id,
      amount: totalPrice,
      currency: "NGN",
      redirect_url: "https://granduer-steel.vercel.app/thank-you",
      customer: {
        email: user.email,
        name: `${user.firstname} ${user.lastname}`,
        phonenumber: user.phone,
      },
      meta: { userId: user.id, order_id },
      customizations: { title: "Grandeur", description: "Order Payment" },
    };

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return res
        .status(500)
        .json({ success: false, message: data.message || "Failed" });
    }

    return res
      .status(201)
      .json({
        success: true,
        message: "Payment initialized",
        link: data.data.link,
        order_id,
      });
  } catch (error) {
    console.error("Init payment error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { transaction_id } = req.body; // Expect POST body
    if (!transaction_id)
      return res
        .status(400)
        .json({ success: false, message: "Missing transaction_id" });

    // Verify transaction with Flutterwave
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
      }
    );
    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: data.message || "Failed to verify transaction",
      });
    }

    // Extract metadata
    const userId = data?.data?.meta?.userId;
    const orderId = data?.data?.meta?.order_id; // consistent variable name
    const amount = data?.data?.amount;
    const status = data?.data?.status;

    if (!userId || !orderId)
      return res
        .status(400)
        .json({ success: false, message: "Missing transaction metadata" });

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }, // Prisma expects number if id is Int
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Fetch user cart
    const userCart = await prisma.cart.findUnique({
      where: { userid: Number(userId) },
      include: { Productcart: { include: { product: true } } },
    });

    // Check if receipt already exists
    let receipt = await prisma.receipt.findUnique({
      where: { orderId },
    });

    if (!receipt) {
      // Create receipt
      receipt = await prisma.receipt.create({
        data: {
          orderId,
          userId: user.uuid, // make sure this matches your Prisma User model (String)
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          phone: user.phone,
          amount,
          transactionId: transaction_id,
          status,
        },
      });

      // Add receipt items
      if (userCart?.Productcart?.length) {
        await prisma.receiptItem.createMany({
          data: userCart.Productcart.map((item) => ({
            receiptId: receipt.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            total: item.quantity * item.product.price,
            productId: item.productid,
          })),
        });
      }
    }

    // Return updated receipt with items
    const updatedReceipt = await prisma.receipt.findUnique({
      where: { orderId },
      include: { receiptItems: true },
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified",
      data: updatedReceipt,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


