const shippop = require('../../controllers/shippop/shippop.controller.js')
const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/price/list", auth, shippop.priceList);
router.post("/booking", auth, shippop.booking);
router.post("/cancel/:tracking_code", auth, shippop.cancelOrder);
router.post("/tracking/:id", auth, shippop.tracking);
router.post("/label/html/:tracking_code", auth, shippop.labelHtml);

module.exports = router