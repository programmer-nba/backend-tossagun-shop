const router = require("express").Router();
const auth = require("../../lib/auth");
const emarking = require("../../controllers/ddscpartner/emarking.controller");

router.get("/", emarking.getOpenProduct);

module.exports = router;
