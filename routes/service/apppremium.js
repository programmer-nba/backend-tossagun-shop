const router = require("express").Router();
const apppremium = require("../../controllers/apppremium/apppremium.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

// Product
router.get("/", auth, apppremium.getProductAll);

router.post("/order", auth, apppremium.createOrder);
// router.post("/", authAdmin, apppremium.create);
// router.get("/", auth, apppremium.getMediaAll);
// router.get("/:id", auth, apppremium.getMediaById);
// router.put("/:id", authAdmin, apppremium.updateMedia);
// router.delete("/:id", authAdmin, apppremium.deleteMedia);

module.exports = router;