const router = require("express").Router();
const { Admins } = require("../model/user/admin.model");
const { Employees } = require("../model/user/employee.model");
const { Members } = require("../model/user/member.model");
require("dotenv").config();
const auth = require("../lib/auth");

router.post("/", auth, async (req, res) => {
  const { decoded } = req;
  try {
    if (decoded && decoded.row === "admin") {
      const id = decoded._id;
      Admins.findOne({ _id: id })
        .then((item) => {
          return res.status(200).send({
            name: item.admin_name,
            username: item.admin_username,
            level: "admin",
            position: item.admin_position,
          });
        })
        .catch(() =>
          res.status(400).send({ message: "มีบางอย่างผิดพลาด", status: false })
        );
    } else if (decoded && decoded.row === "investor") {
      const id = decoded._id;
      Investors.findOne({ _id: id }).then((item) => {
        return res.status(200).send({
          name: item.investor_name,
          username: item.investor_iden,
          phone: item.investor_phone,
          level: "investor",
        });
      });
    } else if (decoded && decoded.row === "landlord") {
      const id = decoded._id;
      Landlords.findOne({ _id: id }).then((item) => {
        return res.status(200).send({
          name: item.landlord_name,
          username: item.landlord_iden,
          level: "landlord",
        });
      });
    } else if (decoded && decoded.row === "member") {
      const id = decoded._id;
      Members.findOne({ _id: id }).then((item) => {
        return res.status(200).send({
          level: "member",
          data: item,
        });
      });
    } else if (decoded && decoded.row === "employee") {
      const id = decoded._id;
      Employees.findOne({ _id: id }).then((item) => {
        return res.status(200).send({
          level: "employee",
          data: item,
        });
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", status: false });
  }
});

module.exports = router;
