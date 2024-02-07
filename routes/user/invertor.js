const router = require("express").Router();
const investors = require("../../controllers/user/invertor.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, investors.create);
router.get("/", auth, investors.findAll);
router.get("/:id", auth, investors.findOne);
router.delete("/:id", authAdmin, investors.delete);
router.put("/:id", auth, investors.update);

router.put("/confirm/:id", authAdmin, investors.confirm);

// เซ็นสัญญา
router.put("/contract/:id", auth, investors.contract);

module.exports = router;
