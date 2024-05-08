const router = require("express").Router();
const commission = require("../../controllers/commission/commission.controller");
const auth = require("../../lib/auth");

router.get("/list", auth, commission.getCommissionByTel);

module.exports = router;