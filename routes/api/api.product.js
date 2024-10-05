const router = require("express").Router();
const product = require("../../controllers/pos/api.product.controller/api.product.controller");
const authPartner = require("../../lib/auth.partner");

// Image
router.get("/image/:imagename", product.getProductImage);

// Product
router.post("/", authPartner, product.getProduct);
// category
router.post("/category", authPartner, product.getCategory);


module.exports = router;