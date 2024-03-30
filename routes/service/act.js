const router = require("express").Router();
const act = require("../../controllers/service/act/act.controller");
const category = require("../../controllers/service/act/category.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

// Category
router.post("/category", authAdmin, category.create);
router.get("/category", auth, category.getCategoryAll);
router.get("/category/:id", auth, category.getCategoryById);
router.put("/category/:id", authAdmin, category.updateCategory);
router.delete("/category/:id", authAdmin, category.deleteCategory);

// Product
router.post("/", authAdmin, act.create);
router.get("/", auth, act.getMediaAll);
router.get("/:id", auth, act.getMediaById);
router.put("/:id", authAdmin, act.updateMedia);
router.delete("/:id", authAdmin, act.deleteMedia);

module.exports = router;