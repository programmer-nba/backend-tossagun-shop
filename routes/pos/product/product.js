const router = require("express").Router();
const products = require("../../../controllers/pos/product.tossagun.controller/product.controller");
const createProduct = require("../../../controllers/pos/product.tossagun.controller/create.product.controller");
const updateProduct = require("../../../controllers/pos/product.tossagun.controller/update.product.controller");
const category = require("../../../controllers/pos/product.tossagun.controller/category.product.controller");
const type = require("../../../controllers/pos/product.tossagun.controller/type.product.controller");
const auth = require("../../../lib/auth");
const authAdmin = require("../../../lib/auth.admin");

router.post("/", authAdmin, createProduct.create);
router.get("/", authAdmin, products.findAll);
router.get("/:id", auth, products.findOne);
router.get("/barcode/:barcode", auth, products.getByBarcode);
router.put("/:id", auth, updateProduct.update);
router.delete("/:id", authAdmin, products.delete);

router.post("/category", authAdmin, category.create);
router.get("/category/all", auth, category.getAll);
router.get("/category/:id", authAdmin, category.getById);
router.put("/category/:id", authAdmin, category.update);
router.delete("/category/:id", authAdmin, category.delete);

router.post("/type", authAdmin, type.create);
router.get("/type/all", auth, type.findAll);
router.get("/type/:id", authAdmin, type.findOne);
router.put("/type/:id", authAdmin, type.update);
router.delete("/type/:id", authAdmin, type.delete);

module.exports = router;
