const customer = require('../../controllers/shippop/customer.controller')
const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.get("/get/all", auth, customer.getAll);
router.delete("/del/:id", auth, customer.delend);
router.get("/get/receive", auth, customer.getReceive);
router.get("/get/sender", auth, customer.getSender);
router.get("/get/one/sender/:id", authAdmin, customer.getOneSender);

module.exports = router