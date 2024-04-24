const insured = require('../../controllers/shippop/insured.controller')
const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/create", authAdmin, insured.create);
router.put("/update/:id", authAdmin, insured.update);
router.put("/push/value/:id", authAdmin, insured.push_value);
router.delete("/delend/:id", authAdmin, insured.delend);
router.delete("/del/value/:id", authAdmin, insured.del_value);
router.get("/get/all", authAdmin, insured.getAll);
router.get("/get/express/:id", authAdmin, insured.getExpress);

module.exports = router