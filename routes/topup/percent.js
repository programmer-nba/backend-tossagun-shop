const router = require("express").Router();
const percent = require("../../controllers/topup/topup.percent.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/", authAdmin, percent.create);
router.get("/", authAdmin, percent.getAll);
router.get("/:id", authAdmin, percent.getById);
router.put("/:id", authAdmin, percent.update);
router.delete("/:id", authAdmin, percent.delete);

module.exports = router;
