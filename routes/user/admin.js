const router = require("express").Router();
const admins = require("../../controllers/user/admin.controller");
// const authAdmin = require("../../lib/auth.admin");

router.post("/", admins.create);

router.get("/", admins.findAll);
router.get("/:id", admins.findOne);

router.delete("/:id", admins.delete);
router.put("/:id", admins.update);

module.exports = router;
