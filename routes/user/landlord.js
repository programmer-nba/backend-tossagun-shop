const router = require("express").Router();
const landlords = require("../../controllers/user/landlord.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

// landlord - เจ้าของที่ดิน
router.post("/", authAdmin, landlords.create);
router.get("/", auth, landlords.findAll);
router.get("/:id", auth, landlords.findOne);
router.delete("/:id", authAdmin, landlords.delete);
router.put("/:id", auth, landlords.update);

router.put("/confirm/:id", authAdmin, landlords.confirm);

// เซ็นสัญญา
router.put("/contract/:id", auth, landlords.contract);

module.exports = router;
