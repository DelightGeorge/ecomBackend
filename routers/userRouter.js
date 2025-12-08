const express = require('express');
const userRouter = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const Uploads = require('../middlewares/uploads');

/**
 * @swagger
 * /loginUser:
 *   post:
 *     summary: User login
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

userRouter.post("/loginUser",  loginUser);



userRouter.post("/registerUser", Uploads.single("image"), registerUser);



module.exports = userRouter;