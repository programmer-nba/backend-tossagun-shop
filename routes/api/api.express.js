const router = require("express").Router();
const express = require("../../controllers/customer/express/api.express.controller");
const authCustomer = require("../../lib/auth.customer")

router.post("/price", authCustomer, express.getPrice);

module.exports = router;