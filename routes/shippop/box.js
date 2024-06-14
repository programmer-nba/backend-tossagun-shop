const router = require("express").Router();
const box = require("../../controllers/shippop/box.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/", auth, box.create);
router.get("/", auth, box.getAll);
router.get("/:id", auth, box.getById);
router.get("/shop/:shopid", auth, box.getByShopId);
router.put("/:id", auth, box.update);
router.delete("/:id", auth, box.delete);

module.exports = router;