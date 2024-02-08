const router = require("express").Router();
const invesments = require("../../controllers/invesment.controll/invesment.controller");
const slip = require("../../controllers/invesment.controll/silp.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/all", authAdmin, invesments.getMoneyAll);
router.get("/:id", auth, invesments.getMoneyById);
router.get("/investorId/:investor_id", auth, invesments.getMoneyByInvestorId);

router.post("/", auth, slip.create);
router.put("/confirm/:id", authAdmin, slip.update);
router.put("/cancel/:id", authAdmin, slip.cancel);

module.exports = router;
