const router = require("express").Router();
const investors = require("../controllers/user/invertor.controller");
const landlords = require("../controllers/user/landlord.controller");

router.post("/investor", investors.create);
router.post("/landlord", landlords.create);

module.exports = router;
