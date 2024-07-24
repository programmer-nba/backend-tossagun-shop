const router = require("express").Router();
const partner = require("../../controllers/user/partner.controller");

router.post("/", partner.create);

module.exports = router;