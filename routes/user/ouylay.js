const router = require("express").Router();
const outlay = require("../../controllers/user/outlay.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, outlay.create);
router.get("/", auth, outlay.findAll);
router.get("/:id", auth, outlay.findOne);
router.delete("/:id", authAdmin, outlay.delete);
router.put("/:id", auth, outlay.update);

router.put("/confirm/:id", authAdmin, outlay.confirm);

// เซ็นสัญญา
router.put("/contract/:id", auth, outlay.contract);

module.exports = router;