const express = require("express");
const {
  addToCart,
  getCart,
  updateCart,
  deleteCart,
} = require("../controllers/cartController");
const { isUser } = require("../middlewares/auth");

const cartRouter = express.Router();

// Add product to cart
cartRouter.post("/addcart", isUser, addToCart);

// Get user cart
cartRouter.get("/getcart", isUser, getCart);

// Update product in cart
cartRouter.patch("/updatecart", isUser, updateCart);

// Delete product from cart
cartRouter.post("/deletecart", isUser, deleteCart); // accept productid in body

module.exports = cartRouter;
