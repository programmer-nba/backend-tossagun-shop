const router = require("express").Router();
const media = require("../../controllers/service.controller/media/media.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.get("/image/:imgname", media.getImage);

router.post("/", authAdmin, media.create);
router.get("/", auth, media.getMediaAll);
router.get("/:id", auth, media.getMediaById);
router.put("/:id", authAdmin, media.updateMedia);
router.delete("/:id", authAdmin, media.deleteMedia);

router.post("/order", auth, media.createOrder);

module.exports = router;