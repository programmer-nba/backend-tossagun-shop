const router = require("express").Router();
const platform = require("../../controllers/user/platform.controller");

router.get("/checkMember", platform.checkMember);
router.get("/member", platform.getAllMember);

module.exports = router;
