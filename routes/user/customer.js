const router = require("express").Router();
const customer = require("../../controllers/user/customer.controller");
const wallet = require("../../controllers/customer/wallet/wallet.controller");
const authCustomer = require("../../lib/auth.customer");

router.post("/token", customer.getToken);

// User
router.post("/", customer.create);
router.post("/wallet", customer.getWalletCus);
router.get("/", customer.getCustomerAll);
router.get("/:id", customer.getCustomerById);
router.put("/:id", customer.updateCustomer);

module.exports = router;