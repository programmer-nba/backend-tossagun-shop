const router = require("express").Router();
const employees = require("../../controllers/user/employee.controller");
const auth = require("../../lib/auth");

router.get("/shop/:shopid", auth, employees.findByShopId);

router.post("/", auth, employees.create);
router.get("/", auth, employees.findAll);
router.get("/:id", auth, employees.findById);
router.put("/:id", auth, employees.update);
router.delete("/:id", auth, employees.delete);

module.exports = router;
