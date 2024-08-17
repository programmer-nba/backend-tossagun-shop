const shippop = require('../../controllers/shippop/shippop.controller.js')
const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/price/list", auth, shippop.priceList);
router.post("/booking", auth, shippop.booking);
router.post("/cancel", auth, shippop.cancelOrder);
router.post("/tracking/:id", shippop.tracking);

router.post("/label", auth, shippop.labelHtml);

// router.post("/dropoff", shippop.dropoff);

module.exports = router