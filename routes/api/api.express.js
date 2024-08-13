const router = require("express").Router();
const express = require("../../controllers/customer/express/api.express.controller");
const authCustomer = require("../../lib/auth.customer")

router.post("/price", authCustomer, express.getPrice);
router.post("/booking", authCustomer, express.booking);
router.post("/label", authCustomer, express.labelHtml);

module.exports = router;