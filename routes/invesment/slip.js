const router = require("express").Router();
const invesments = require("../../controllers/invesment.controll/invesment.controller");
const slip = require("../../controllers/invesment.controll/silp.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/all", authAdmin, invesments.getAll);
router.get("/:id", auth, invesments.getById);
router.get("/investorId/:investor_id", auth, invesments.getByInvestorId);

router.post("/", auth, slip.create);
router.put("/confirm/:id", authAdmin, slip.update);

module.exports = router;
