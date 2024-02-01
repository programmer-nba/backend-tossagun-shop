const router = require("express").Router();
const invertors = require("../../controllers/user/invertor.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, invertors.create);

router.get("/", authAdmin, invertors.findAll);
router.get("/:id", authAdmin, invertors.findOne);

router.delete("/:id", authAdmin, invertors.delete);
router.put("/:id", authAdmin, invertors.update);

module.exports = router;