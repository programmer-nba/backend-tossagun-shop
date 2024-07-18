const router = require("express").Router();
const percent = require("../../controllers/pos/percent.invest.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.post("/", authAdmin, percent.create);
router.get("/", auth, percent.getPercentAll);
router.get("/:id", auth, percent.getPercentById);
router.get("/code/:code", auth, percent.getPercentByCode);
router.put("/:id", authAdmin, percent.updatePercentInvest);

module.exports = router;