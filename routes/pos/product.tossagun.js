const router = require("express").Router();
const product = require("../../controllers/pos/product.tossagun/product.tossagun.controller");
const createProduct = require("../../controllers/pos/product.tossagun/create.product.tossagun.controller");
const updateProduct = require("../../controllers/pos/product.tossagun/update.product.tossagun.controller");
const auth = require("../../lib/auth");

router.post("/", createProduct.create);
router.put("/:id", updateProduct.update);

router.get("/", auth, product.findAll);
router.get("/:id", auth, product.findOne);
router.get("/barcode/:barcode", auth, product.getByBarcode);

router.delete("/:id", auth, product.delete);

module.exports = router;
