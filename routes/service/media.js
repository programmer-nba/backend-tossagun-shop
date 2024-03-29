const router = require("express").Router();
const media = require("../../controllers/service/media/media.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/", authAdmin, media.create);
router.get("/", auth, media.getMediaAll);
router.get("/:id", media.getMediaById);
router.put("/:id", authAdmin, media.updateMedia);
router.delete("/:id", authAdmin, media.deleteMedia);

module.exports = router