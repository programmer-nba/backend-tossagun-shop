const router = require("express").Router();
const express = require("../../controllers/ddscpartner/express.controller");
const auth = require("../../lib/auth");

router.post("/price", express.priceList);
router.post("/booking", express.booking);

module.exports = router;