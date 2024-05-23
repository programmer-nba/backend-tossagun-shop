const router = require("express").Router();
const name = require("../../controllers/shippop/name.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/", authAdmin, name.create);
router.get("/", auth, name.getAll);
router.get("/:id", auth, name.getById);
router.put("/:id", authAdmin, name.update);
router.delete("/:id", authAdmin, name.delete);

module.exports = router;