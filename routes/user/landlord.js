const router = require("express").Router();
const landlords = require("../../controllers/user/landlord.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, landlords.create);

router.get("/", authAdmin, landlords.findAll);
router.get("/:id", authAdmin, landlords.findOne);

router.delete("/:id", authAdmin, landlords.delete);
router.put("/:id", authAdmin, landlords.update);

module.exports = router;