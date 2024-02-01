const router = require("express").Router();
const {Admins} = require("../model/user/admin.model");
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
    }
  } catch (error) {
    res.status(500).send({message: "Internal Server Error", status: false});
  }
});

module.exports = router;
