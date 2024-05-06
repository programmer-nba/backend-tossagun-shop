const router = require("express").Router();
const program = require("../../controllers/service.controller/program/program.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.get("/image/:imgname", program.getImage);

router.post("/", authAdmin, program.create);
router.get("/", auth, program.getMediaAll);
router.get("/:id", auth, program.getMediaById);
router.put("/:id", authAdmin, program.updateMedia);
router.delete("/:id", authAdmin, program.deleteMedia);

module.exports = router;