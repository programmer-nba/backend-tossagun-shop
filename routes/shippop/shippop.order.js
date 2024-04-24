const shippop = require('../../controllers/shippop/order.controller.js')
const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/price/list", auth, shippop.priceList);
router.post("/booking", auth, shippop.booking);
router.post("/cancel/:id", auth, shippop.cancelOrder);
router.post("/tracking/:id", auth, shippop.tracking);
router.post("/label/html", auth, shippop.labelHtml);

module.exports = router