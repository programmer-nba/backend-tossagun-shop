const router = require("express").Router();
const account = require("../../controllers/service.controller/account/account.controller");
const category = require("../../controllers/service.controller/account/category.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.get("/image/:imgname", account.getImage);

// Category
router.post("/category", authAdmin, category.create);
router.get("/category", auth, category.getCategoryAll);
router.get("/category/:id", auth, category.getCategoryById);
router.put("/category/:id", authAdmin, category.updateCategory);
router.delete("/category/:id", authAdmin, category.deleteCategory);

router.post("/", authAdmin, account.create);
router.get("/", auth, account.getProductAll);
router.get("/:id", auth, account.getProductById);
router.get("/cate/:id", auth, account.getProductByCategoryId);
router.put("/:id", authAdmin, account.updateProduct);
router.delete("/:id", authAdmin, account.deleteProduct);

router.post('/order', auth, account.createOrder);

module.exports = router;