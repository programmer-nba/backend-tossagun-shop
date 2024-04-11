const router = require("express").Router();
const iata = require("../../controllers/AOC/aoc.api.iata.controller");
const auth = require("../../lib/auth");

router.post("/create",auth, iata.createIATA);
router.get("/get/iata", auth, iata.getIATA);
router.get("/get/iata/:id", auth, iata.getIATAById);
router.put("/update/:id", auth, iata.updateIATAById);
router.delete("/del/:id", auth, iata.deleteIATA);
// router.get("/get/equipment", auth, appendix.getEquipment);
// router.get("/store-id/:store_id", auth, order.findByStoreId);
// router.get("/ponba/:ponba_id", auth, order.findByPoNbaId);

module.exports = router;