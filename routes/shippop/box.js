const router = require("express").Router();
const box = require("../../controllers/shippop/box.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/", authAdmin, box.create);
router.get("/", auth, box.getAll);
router.get("/:id", auth, box.getById);
router.put("/:id", authAdmin, box.update);
router.delete("/:id", authAdmin, box.delete);

module.exports = router;