const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productid, color, size, quantity } = req.body;
    const parsedProductId = parseInt(productid);

    const existingCart = await prisma.cart.upsert({
      where: { userid: userId },
      update: {},
      create: { userid: userId },
    });

    const product = await prisma.product.findUnique({ where: { id: parsedProductId } });
    if (!product) return res.status(400).json({ success: false, message: "Product does not exist" });

    const existingCartItem = await prisma.productCart.findUnique({
      where: { productid_cartid: { productid: parsedProductId, cartid: existingCart.id } },
    });

    if (existingCartItem) {
      // increment quantity
      await prisma.productCart.update({
        where: { productid_cartid: { productid: parsedProductId, cartid: existingCart.id } },
        data: { quantity: existingCartItem.quantity + (quantity || 1) },
      });
    } else {
      await prisma.productCart.create({
        data: {
          product: { connect: { id: parsedProductId } },
          cart: { connect: { id: existingCart.id } },
          selectedcolor: color || null,
          selectedsize: size || null,
          quantity: quantity || 1,
        },
      });
    }

    const userCart = await prisma.cart.findUnique({
      where: { userid: userId },
      include: { Productcart: { include: { product: true } } },
    });

    return res.status(201).json({ success: true, message: "Added to cart", data: userCart });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update cart
exports.updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productid, size, color, quantity } = req.body;
    const parsedProductId = parseInt(productid);

    const userCart = await prisma.cart.findUnique({ where: { userid: userId } });
    if (!userCart) return res.status(400).json({ success: false, message: "Cart does not exist" });

    const cartItem = await prisma.productCart.findUnique({
      where: { productid_cartid: { productid: parsedProductId, cartid: userCart.id } },
    });
    if (!cartItem) return res.status(400).json({ success: false, message: "Item not in cart" });

    const payload = {
      ...(quantity !== undefined && { quantity: Number(quantity) }),
      ...(size !== undefined && { selectedsize: size }),
      ...(color !== undefined && { selectedcolor: color }),
    };

    if (Object.keys(payload).length === 0) return res.status(400).json({ success: false, message: "No valid fields to update" });

    await prisma.productCart.update({
      where: { productid_cartid: { productid: parsedProductId, cartid: userCart.id } },
      data: payload,
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userid: userId },
      include: { Productcart: { include: { product: true } } },
    });

    return res.status(200).json({ success: true, message: "Cart updated", data: updatedCart });
  } catch (error) {
    console.error("Update cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete or decrement cart item
exports.deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productid } = req.body;
    const parsedProductId = parseInt(productid);

    const userCart = await prisma.cart.findUnique({ where: { userid: userId } });
    if (!userCart) return res.status(400).json({ success: false, message: "Cart does not exist" });

    const cartItem = await prisma.productCart.findUnique({
      where: { productid_cartid: { productid: parsedProductId, cartid: userCart.id } },
    });
    if (!cartItem) return res.status(400).json({ success: false, message: "Item not in cart" });

    if (cartItem.quantity > 1) {
      await prisma.productCart.update({
        where: { productid_cartid: { productid: parsedProductId, cartid: userCart.id } },
        data: { quantity: cartItem.quantity - 1 },
      });
    } else {
      await prisma.productCart.delete({
        where: { productid_cartid: { productid: parsedProductId, cartid: userCart.id } },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userid: userId },
      include: { Productcart: { include: { product: true } } },
    });

    return res.status(200).json({ success: true, message: "Cart updated", data: updatedCart });
  } catch (error) {
    console.error("Delete cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const userCart = await prisma.cart.findUnique({
      where: { userid: userId },
      include: { Productcart: { include: { product: true } } },
    });

    if (!userCart || userCart.Productcart.length === 0) return res.status(200).json({ success: true, message: "Cart is empty", data: { Productcart: [] } });

    return res.status(200).json({ success: true, message: "Cart fetched", data: userCart });
  } catch (error) {
    console.error("Get cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
