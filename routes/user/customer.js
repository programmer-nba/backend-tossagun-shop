const router = require("express").Router();
const customer = require("../../controllers/user/customer.controller");

router.post("/", customer.create);
router.get("/", customer.getCustomerAll);
router.put("/:id", customer.updateCustomer);

module.exports = router;