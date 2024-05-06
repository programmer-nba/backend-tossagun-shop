const airline = require('../../controllers/AOC/aoc.airline.code.controller')
const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/create", authAdmin, airline.create);
router.get("/get/all", authAdmin, airline.getAll);
router.get("/get/:id", authAdmin, airline.getById);
router.put("/update/:id", authAdmin, airline.update);
router.delete("/del/:id", authAdmin, airline.delend);

module.exports = router