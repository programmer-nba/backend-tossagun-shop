const router = require("express").Router();
const contract = require("../../controllers/contract/contract.controller");

router.get("/all", contract.getContractAll);
router.post("/create", contract.createContract);
router.get("/:partner_id", contract.getContractByPartnerId);

module.exports = router;
