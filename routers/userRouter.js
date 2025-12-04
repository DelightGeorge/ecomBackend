const express = require('express');
const userRouter = express.Router();
const { registerUser, loginUser, updateUserController } = require('../controllers/userController');
const Uploads = require('../middlewares/uploads');
const { isUser } = require('../middlewares/auth');

userRouter.post("/registerUser", Uploads.single("image"), registerUser);
userRouter.post("/loginUser",  loginUser);
userRouter.put("/update-user", isUser, updateUserController);


module.exports = userRouter;