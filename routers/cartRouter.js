const express = require("express");
const {
  addToCart,
  getCart,
  updateCart,
  deleteCart,
} = require("../controllers/cartController");
const { isUser } = require("../middlewares/auth");

const cartRouter = express.Router();


/**
 * @swagger
 * /addcart:
 *   post:
 *     summary: Add a product to the user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 */
// Add product to cart
cartRouter.post("/addcart", isUser, addToCart);

/**
 * @swagger
 * /getcart:
 *   get:
 *     summary: Get the current user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's cart
 */
// Get user cart
cartRouter.get("/getcart", isUser, getCart);
/**
 * @swagger
 * /updatecart:
 *   patch:
 *     summary: Update a product in the user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       200:
 *         description: Product updated in cart successfully
 */
// Update product in cart
cartRouter.patch("/updatecart", isUser, updateCart);
/**
 * @swagger
 * /deletecart:
 *   post:
 *     summary: Delete a product from the user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *             required:
 *               - productId
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 */
// Delete product from cart
cartRouter.post("/deletecart", isUser, deleteCart); // accept productid in body

module.exports = cartRouter;
