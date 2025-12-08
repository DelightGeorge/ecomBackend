const express = require("express");
const categoryRouter = express.Router();


/**
 * @swagger
 * /createCategory:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Category created successfully
 */
categoryRouter.post(
  "/createCategory",
  require("../controllers/categoryController").createCategory
);
/**
 * @swagger
 * /getAllCategories:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: Returns a list of all categories
 */
categoryRouter.get(
  "/getAllCategories",
  require("../controllers/categoryController").getAllCategory
);

/**
 * @swagger
 * /getSingleCategory/{name}:
 *   get:
 *     summary: Get a single category by name
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the category to retrieve
 *     responses:
 *       200:
 *         description: Returns the requested category
 */
categoryRouter.get(
  "/getSingleCategory/:name",
  require("../controllers/categoryController").getSingleCategory
);
/**
 * @swagger
 * /updateCategory:
 *   patch:
 *     summary: Update an existing category
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
categoryRouter.patch(
  "/updateCategory",
  require("../controllers/categoryController").updateCategory
);
/**
 * @swagger
 * /deleteCategory:
 *   delete:
 *     summary: Delete a category
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
categoryRouter.delete(
  "/deleteCategory",
  require("../controllers/categoryController").deleteCategory
);

module.exports = categoryRouter;
