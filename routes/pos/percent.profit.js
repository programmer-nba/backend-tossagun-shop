const router = require("express").Router();
const percent = require("../../controllers/pos/percent.profit.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/", authAdmin, percent.create);
router.get("/", auth, percent.findAll);
router.get("/:id", auth, percent.findOne);
router.get("/code/:id", auth, percent.findCode);
router.put("/:id", authAdmin, percent.update);

module.exports = router;
