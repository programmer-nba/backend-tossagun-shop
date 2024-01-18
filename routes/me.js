const router = require("express").Router();
const {Admins} = require("../model/user/admin.model");
const {Partners} = require("../model/user/partner.model");
const {Employees} = require("../model/user/employee.model");
require("dotenv").config();
const auth = require("../lib/auth");

router.post("/", auth, async (req, res) => {
  const {decoded} = req;
  try {
    if (decoded && decoded.row === "admin") {
      const id = decoded._id;
      Admins.findOne({_id: id})
        .then((item) => {
          return res.status(200).send({
            name: item.admin_name,
            username: item.admin_username,
            level: "admin",
            position: item.admin_position,
          });
        })
        .catch(() =>
          res.status(400).send({message: "มีบางอย่างผิดพลาด", status: false})
        );
    } else if (decoded && decoded.row === "partner") {
      const id = decoded._id;
      Partners.findOne({_id: id})
        .then((item) => {
          return res.status(200).send({
            _id: item._id,
            name: item.partner_name,
            username: item.partner_email,
            level: "partner",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send({message: "มีบางอย่างผิดพลาด", status: false});
        });
    } else if (decoded && decoded.row === "employee") {
      const id = decoded._id;
      Employees.findOne({_id: id})
        .then((item) => {
          return res.status(200).send({
            name: item.employee_name,
            username: item.employee_username,
            level: "employee",
            position: item.employee_position,
          });
        })
        .catch(() =>
          res.status(400).send({message: "มีบางอย่างผิดพลาด", status: false})
        );
    }
  } catch (error) {
    res.status(500).send({message: "Internal Server Error", status: false});
  }
});

module.exports = router;
