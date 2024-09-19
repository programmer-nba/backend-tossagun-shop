const router = require("express").Router();
const express = require("../../controllers/ddscpartner/express.controller");
const auth = require("../../lib/auth");

router.post("/price", express.priceList);

module.exports = router;