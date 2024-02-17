const router = require("express").Router();
const platform = require("../../controllers/user/platform.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/checkMember/:tel", platform.checkMember);
router.post("/register", platform.register);
router.post("/teammember/:tel", platform.getTeammember);
router.post("/member/all", authAdmin, platform.getMember);

module.exports = router;
