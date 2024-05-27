const router = require("express").Router();
const investors = require("../controllers/user/invertor.controller");
const landlords = require("../controllers/user/landlord.controller");
const outlay = require("../controllers/user/outlay.controller");
const register = require("../controllers/register/register.controller");
const auth = require("../lib/auth");

router.post("/investor", investors.create);
router.post("/landlord", landlords.create);
router.post("/outlay", outlay.create);

router.post("/token", auth, register.getToken);

module.exports = router;
