const percent = require('../../controllers/shippop/percent.controller.js')
const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/", authAdmin, percent.create);
router.get("/get/all", authAdmin, percent.getAll);
router.get("/get/:id", authAdmin, percent.getById);
router.put("/update/:id", authAdmin, percent.update);
router.delete("/del/:id", authAdmin, percent.delend);

module.exports = router