const router = require("express").Router();
const appendix = require("../../controllers/AOC/aoc.api.service.controller");
const auth = require("../../lib/auth");

router.get("/get/airline",auth, appendix.getAirline);
router.get("/get/airport", auth, appendix.getAirport);
router.get("/get/getAirportinfo", auth, appendix.getAirportinfo);
router.get("/get/city", auth, appendix.getCity);
router.get("/get/country", auth, appendix.getCountry);
router.get("/get/equipment", auth, appendix.getEquipment);
// router.get("/store-id/:store_id", auth, order.findByStoreId);
// router.get("/ponba/:ponba_id", auth, order.findByPoNbaId);

module.exports = router;