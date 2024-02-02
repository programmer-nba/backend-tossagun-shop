const router = require("express").Router();
const landlords = require("../../controllers/user/landlord.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

// landlord - เจ้าของที่ดิน
router.post("/", authAdmin, landlords.create);
router.get("/", authAdmin, landlords.findAll);
router.get("/:id", authAdmin, landlords.findOne);
router.delete("/:id", authAdmin, landlords.delete);
router.put("/:id", authAdmin, landlords.update);

// land - ที่ดิน
router.post("/", auth);

module.exports = router;
