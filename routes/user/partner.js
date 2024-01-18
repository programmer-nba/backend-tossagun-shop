const router = require("express").Router();
const partner = require("../../controllers/user/partner.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, partner.create);

router.get("/", authAdmin, partner.findAll);
router.get("/:id", authAdmin, partner.findOne);

router.delete("/:id", authAdmin, partner.delete);
router.put("/:id", authAdmin, partner.update);

module.exports = router;
