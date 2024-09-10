const router = require("express").Router();
const cashcard = require("../../controllers/cashcard/cashcard.controller");
const auth = require("../../lib/auth");

router.post("/", cashcard.getProductAll);

module.exports = router;