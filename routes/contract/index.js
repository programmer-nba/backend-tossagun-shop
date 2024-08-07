const router = require("express").Router();
const contract = require("../../controllers/contract/contract.controller");

router.post("/PDPA", contract.getContractPDPA);
router.post("/RENT-WEB", contract.getContractCondition);

module.exports = router;
