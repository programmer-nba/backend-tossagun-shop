const router = require("express").Router();
const product = require("../../controllers/pos/product.tossagun.controller/product.controller");
const auth = require("../../lib/auth");

router.get("/by/credit", auth, product.findByCredit);

module.exports = router;
