const router = require("express").Router();
const act = require("../../controllers/service.controller/act/act.controller");
const category = require("../../controllers/service.controller/act/category.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.get("/image/:imgname", act.getImage)

// Category
router.post("/category", authAdmin, category.create);
router.get("/category", auth, category.getCategoryAll);
router.get("/category/:id", auth, category.getCategoryById);
router.put("/category/:id", authAdmin, category.updateCategory);
router.delete("/category/:id", authAdmin, category.deleteCategory);

// Product
router.post("/", authAdmin, act.create);
router.get("/", auth, act.getAll);
router.get("/:id", auth, act.getById);
router.put("/:id", authAdmin, act.update);
router.delete("/:id", authAdmin, act.delete);

module.exports = router;