const router = require("express").Router();
const ponba = require("../../../controllers/pos/preorder.controller/preorder.tossagun.controller");
const auth = require("../../../lib/auth");
const authAdmin = require("../../../lib/auth.admin");

router.post("/", auth, ponba.create);
router.get("/", auth, ponba.findAll);
router.get("/:id", auth, ponba.findOne);
router.get("/shop/:id", auth, ponba.findShopId);
router.delete("/:id", auth, ponba.delete);
router.put("/:id", auth, ponba.update);

router.post("/ref", authAdmin, ponba.createRef);

module.exports = router;
