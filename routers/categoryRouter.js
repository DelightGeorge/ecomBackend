const express = require("express");
const categoryRouter = express.Router();

categoryRouter.post(
  "/createCategory",
  require("../controllers/categoryController").createCategory
);
categoryRouter.get(
  "/getAllCategories",
  require("../controllers/categoryController").getAllCategory
);
categoryRouter.get(
  "/getSingleCategory/:name",
  require("../controllers/categoryController").getSingleCategory
);

categoryRouter.patch(
  "/updateCategory",
  require("../controllers/categoryController").updateCategory
);
categoryRouter.delete(
  "/deleteCategory",
  require("../controllers/categoryController").deleteCategory
);

module.exports = categoryRouter;
