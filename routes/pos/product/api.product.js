const router = require("express").Router();
const product = require("../../../controllers/pos/api.product.controller/api.product.controller");
const authPartner = require("../../../lib/auth.partner");

// Image
router.get("/image/:imagename", product.getProductImage);

router.post("/", authPartner, product.getProductAll);

module.exports = router;