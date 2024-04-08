const router = require("express").Router();
const apppremium = require("../../controllers/service.controller/apppremium/apppremium.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

// Product
router.get("/", apppremium.getProductAll);
// router.post("/", authAdmin, apppremium.create);
// router.get("/", auth, apppremium.getMediaAll);
// router.get("/:id", auth, apppremium.getMediaById);
// router.put("/:id", authAdmin, apppremium.updateMedia);
// router.delete("/:id", authAdmin, apppremium.deleteMedia);

module.exports = router;