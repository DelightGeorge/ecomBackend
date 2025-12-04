const { PrismaClient } = require("@prisma/client");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      price,
      currency,
      sizes,
      defaultSize,
      colors,
      defaultColor,
      bestSeller,
      subcategory,
      rating,
      discount,
      newArrival,
      tags,
      categoryId,
    } = req.body;

    if (typeof sizes === "string") sizes = JSON.parse(sizes);
    if (typeof colors === "string") colors = JSON.parse(colors);
    if (typeof tags === "string") tags = JSON.parse(tags);

    const parsedCategoryId = parseInt(categoryId);

    const requiredFields = {
      name,
      description,
      price,
      currency,
      sizes,
      defaultSize,
      colors,
      defaultColor,
      categoryId,
    };

    for (let [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return res
          .status(400)
          .json({ success: false, message: `Missing ${key}` });
      }
    }

    const existingProduct = await prisma.product.findFirst({
      where: { name, categoryId: parsedCategoryId },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product already exists!" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "Product");
    }

const newProduct = await prisma.product.create({
  data: {
    name,
    description,
    price: Number(price),
    currency,
    sizes,
    defaultSize,
    colors,
    defaultColor,
    bestSeller: bestSeller === "true",
    subcategory,
    rating: Number(rating) || 0,       // default to 0 if missing
    discount: Number(discount) || 0,   // default to 0 if missing
    newArrival: newArrival === "true",
    tags,
    category: { connect: { id: parsedCategoryId } }, // connect to category
    image: imageUrl,
  },
});


    return res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: newProduct,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const allProdcts = await prisma.product.findMany();
    if (!allProdcts) {
      return res.status(404).json({
        success: false,
        message: "Unable to get all products!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All products retrieved successfully!",
      data: allProdcts,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing Product",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully!",
      data: product,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { values } = req.body;
    const parsedId = parseInt(id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing product ID!",
      });
    }

    if (!values) {
      return res.status(400).json({
        success: false,
        message: "Missing values to update!",
      });
    }

    if (typeof values === "string") {
      values = JSON.parse(values);
    }

    if (values.sizes && typeof values.sizes === "string")
      values.sizes = JSON.parse(values.sizes);
    if (values.colors && typeof values.colors === "string")
      values.colors = JSON.parse(values.colors);
    if (values.tags && typeof values.tags === "string")
      values.tags = JSON.parse(values.tags);

    if (values.price) values.price = Number(values.price);
    if (values.rating) values.rating = Number(values.rating);
    if (values.discount) values.discount = Number(values.discount);
    if (values.categoryId) values.categoryId = parseInt(values.categoryId);

    if (values.bestSeller) values.bestSeller = values.bestSeller === "true";
    if (values.newArrival) values.newArrival = values.newArrival === "true";

    const existingProduct = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist in database!",
      });
    }

    if (req.file) {
      const imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "image",
        "Product"
      );
      values.image = imageUrl;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parsedId },
      data: { ...values },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: updatedProduct,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id, values } = req.params;
  const parsedId = parseInt(id);
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: parsedId },
    });
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist in database!",
      });
    }

    const deletedProduct = await prisma.product.delete({
      where: { id: parsedId },
    });
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
      data: deletedProduct,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
