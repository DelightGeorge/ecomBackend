const express = require("express");
const uploads = require("../middlewares/uploads");
const { createProduct, getSingleProduct, deleteProduct, updateProduct, getAllProduct } = require("../controllers/productController");
const { isUser, isAdmin, isSameUser } = require("../middlewares/auth");
const productRouter = express.Router();

 
productRouter.post("/createProduct", isUser, isAdmin, uploads.single("image"), createProduct);
productRouter.delete("/deleteProduct/:id", isUser, isAdmin, deleteProduct);
productRouter.put("/updateProduct/:id", isUser, isAdmin, uploads.single("image"), updateProduct);
productRouter.get("/getSingleProduct/:id", getSingleProduct);
productRouter.get("/getAllProduct", getAllProduct);

module.exports = productRouter;