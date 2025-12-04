// routes/paymentRouter.js
const express = require("express");
const { isUser } = require("../middlewares/auth");
const {
  verifyPayment,
  initializePayment,
} = require("../controllers/paymentController");

const paymentRouter = express.Router();

// Protected routes
paymentRouter.post("/initialize-payment", isUser, initializePayment);
paymentRouter.post("/verifypayment", isUser, verifyPayment);

module.exports = paymentRouter;
