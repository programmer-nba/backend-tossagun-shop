const router = require("express").Router();
const investors = require("../controllers/user/invertor.controller");
const landlords = require("../controllers/user/landlord.controller");
const outlay = require("../controllers/user/outlay.controller");

router.post("/investor", investors.create);
router.post("/landlord", landlords.create);
router.post("/outlay", outlay.create);

module.exports = router;
