const router = require("express").Router();
// const barcodeShop = require("../../controllers/pos/check.controller/check.barcode.shop");
const barcodeTossagun = require("../../controllers/pos/check.controller/check.barcode.tossagun");

const auth = require("../../lib/auth");

// router.post("/barcode/shop", auth, barcodeShop.create);
router.post("/barcode/tossagun", auth, barcodeTossagun.create);

module.exports = router;
