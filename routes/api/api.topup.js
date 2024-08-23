const router = require("express").Router();
const topup = require("../../controllers/customer/topup/api.topup.controller");
const authCustomer = require("../../lib/auth.customer");

router.post("/booking", authCustomer, topup.booking);

module.exports = router;