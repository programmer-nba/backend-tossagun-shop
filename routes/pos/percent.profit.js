const router = require("express").Router();
const percent = require("../../controllers/pos/percent.profit.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, percent.create);
router.get("/", authAdmin, percent.findAll);
router.get("/:id", authAdmin, percent.findOne);
router.get("/code/:id", authAdmin, percent.findCode);
router.put("/:id", authAdmin, percent.update);

module.exports = router;
