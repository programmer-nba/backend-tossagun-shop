const router = require("express").Router();
const topup = require("../../controllers/topup/topup.service.controller");
const auth = require("../../lib/auth");

router.post("/booking", auth, topup.booking);

module.exports = router;