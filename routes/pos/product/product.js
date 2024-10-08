const router = require("express").Router();
const products = require("../../../controllers/pos/product.tossagun.controller/product.controller");
const createProduct = require("../../../controllers/pos/product.tossagun.controller/create.product.controller");
const updateProduct = require("../../../controllers/pos/product.tossagun.controller/update.product.controller");
const category = require("../../../controllers/pos/product.tossagun.controller/category.product.controller");
const type = require("../../../controllers/pos/product.tossagun.controller/type.product.controller");
const auth = require("../../../lib/auth");
const authAdmin = require("../../../lib/auth.admin");

router.get("/image/:imgname", products.getImage);

// partner
router.post("/partner", createProduct.create);

router.get("/bypartner/:id", products.getbydealer);
router.get("/partner/category/all", category.getAll);
router.put("/partner/:id", updateProduct.update);
router.delete("/partner/:id", products.delete);

router.post("/", authAdmin, createProduct.create);
router.get("/", auth, products.findAll);
router.get("/:id", auth, products.findOne);
router.get("/barcode/:barcode", products.getByBarcode);
router.put("/:id", auth, updateProduct.update);
router.get("/by/credit", auth, products.findByCredit);
router.delete("/:id", authAdmin, products.delete);

router.post("/category", authAdmin, category.create);
router.get("/category/all", category.getAll);
router.get("/category/:id", auth, category.getById);
router.put("/category/:id", authAdmin, category.update);
router.delete("/category/:id", authAdmin, category.delete);

router.post("/type", type.create);
router.get("/type/all", type.getTypeAll);
router.get("/type/:id", auth, type.getTypeById);
router.put("/type/:id", authAdmin, type.update);
router.delete("/type/:id", authAdmin, type.delete);

module.exports = router;
