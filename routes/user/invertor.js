const router = require("express").Router();
const investors = require("../../controllers/user/invertor.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, investors.create);
router.get("/", authAdmin, investors.findAll);
router.get("/:id", authAdmin, investors.findOne);
router.delete("/:id", authAdmin, investors.delete);
router.put("/:id", authAdmin, investors.update);

module.exports = router;