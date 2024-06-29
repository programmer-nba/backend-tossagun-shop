const router = require("express").Router();
const register = require("../controllers/register/register.controller");
const auth = require("../lib/auth");

router.post("/token", auth, register.getToken);

module.exports = router;