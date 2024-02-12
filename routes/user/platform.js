const router = require("express").Router();
const platform = require("../../controllers/user/platform.controller");

router.post("/checkMember/:tel", platform.checkMember);
router.post("/register", platform.register);
router.post("/teammember/:tel", platform.getTeammember);

module.exports = router;
