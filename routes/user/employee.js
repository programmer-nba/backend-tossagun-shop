const router = require("express").Router();
const employee = require("../../controllers/user/employee.controller");
// const auth = require("../../lib/auth");

router.get("/shop/:id", employee.findByShopId);

router.post("/", employee.create);

router.get("/", employee.findAll);
router.get("/:id", employee.findOne);

router.delete("/:id", employee.delete);
router.put("/:id", employee.update);

module.exports = router;
