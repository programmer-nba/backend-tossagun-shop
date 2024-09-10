const router = require("express").Router();
const topup = require("../../controllers/topup/topup.premium.controller");
const auth = require("../../lib/auth");

router.post("/", topup.getProductAll);

module.exports = router;