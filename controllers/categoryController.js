const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCategory = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Name Field!" });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name: name },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists!" });
    }
    const newCategory = await prisma.category.create({
      data: { name },
    });

    if (!newCategory) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to create category!" });
    }

    return res.status(201).json({
      success: true,
      message: "Category created successfully!",
    });
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const allCategory = await prisma.category.findMany();
    if (!allCategory) {
      return res
        .status(400)
        .json({ success: false, message: "No category found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully!",
      data: allCategory,
    });
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

exports.getSingleCategory = async (req, res) => {
  const { name } = req.params;
  try {
    const singleCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (!singleCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully!",
      data: singleCategory,
    });
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, id } = req.body;

  const parseId = parseInt(id);
  try {
    //check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseId },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category does not exist in database!",
      });
    }
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });
    if (!updatedCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to update category!" });
    }
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      message: "Internal server error, please try again later!",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.body;

  const parseId = parseInt(id);
  try {
    //check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseId },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category does not exist in database!",
      });
    }
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id Not Found!",
      });
    }

    const deletedCategory = await prisma.category.delete({
      where: { id: parseId },
    });

    if (!deletedCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to delete category!" });
    }
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again later!",
    });
  }
};
