const manage = require('../../controllers/shippop/booking.manage.controller')
const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.put("/update/:id", auth, manage.update);
router.delete("/delete/:id", auth, manage.delend);
router.get("/get/all", auth, manage.getAll);
router.get("/get/:id", auth, manage.getById);

module.exports = router