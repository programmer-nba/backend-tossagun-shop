const router = require("express").Router();
const platform = require("../../controllers/user/platform.controller");
const authAdmin = require("../../lib/auth.admin");
const authPlatform = require("../../lib/auth.platform")

router.post("/checkMember/:tel", platform.checkMember);
router.post("/register", platform.register);
router.post("/teammember/:tel", platform.getTeammember);
router.post("/member/all", authAdmin, platform.getMemberAll);

router.post("/genPublicToken", platform.genPublicToken);
router.get("/commission/list/:tel", authPlatform, platform.getCommissionAll);

module.exports = router;
