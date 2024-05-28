const bcrypt = require("bcrypt");
const { Employees, validate } = require("../../model/user/employee.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(400)
        .send({ message: error.details[0].message, status: false });

    const user = await Employees.findOne({
      employee_username: req.body.employee_username,
    });

    if (user)
      return res.status(409).send({
        status: false,
        message: "Username ดังกล่าวไม่สามารถใช้งานได้",
      });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.employee_password, salt);

    const result = await new Employees({
      ...req.body,
      employee_password: hashPassword,
    }).save();
    return res
      .status(201)
      .send({ message: "สร้างข้อมูลสำเร็จ", status: true, result: result });
  } catch (error) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.findAll = async (req, res) => {
  try {
    Employees.find()
      .then(async (data) => {
        return res.send({ data, message: "success", status: true });
      })
      .catch((err) => {
        return res.status(500).send({
          message: err.message || "มีบางอย่างผิดพลาด",
        });
      });
  } catch (error) {
    res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.findById = async (req, res) => {
  const id = req.params.id;
  try {
    Employees.findById(id)
      .then((data) => {
        if (!data)
          return res
            .status(404)
            .send({ message: "ไม่สามารถหาผู้ใช้งานนี้ได้", status: false });
        else res.send({ data, status: true });
      })
      .catch((err) => {
        return res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          status: false,
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.findByShopId = async (req, res) => {
  try {
    const id = req.params.shopid;
    const pipelint = [
      {
        $match: { employee_shop_id: id },
      }
    ];
    const employee = await Employees.aggregate(pipelint);
    if (!employee)
      return res.status(403).send({ status: false, message: "ดึงข้อมูลพนักงานไม่สำเร็จ" });
    return res.status(200).send({ status: true, message: "ดึงข้อมูลพนักสำเร็จ", data: employee });
  } catch (error) {
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        message: "ส่งข้อมูลผิดพลาด",
      });
    }
    const id = req.params.id;
    if (!req.body.employee_password) {
      Employees.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then((data) => {
          if (!data) {
            return res.status(404).send({
              message: `ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้`,
              status: false,
            });
          } else
            return res.send({
              message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว",
              status: true,
            });
        })
        .catch((err) => {
          return res.status(500).send({
            message: "มีบ่างอย่างผิดพลาด" + id,
            status: false,
          });
        });
    } else {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.employee_password, salt);
      Employees.findByIdAndUpdate(
        id,
        { ...req.body, employee_password: hashPassword },
        { useFindAndModify: false }
      )
        .then((data) => {
          if (!data) {
            return res.status(404).send({
              message: `ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้`,
              status: false,
            });
          } else
            return res.send({
              message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว",
              status: true,
            });
        })
        .catch((err) => {
          return res.status(500).send({
            message: "ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้",
            status: false,
          });
        });
    }
  } catch (error) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    Employees.findByIdAndDelete(id, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          return res.status(404).send({
            message: `ไม่สามารถลบผู้ใช้งานนี้ได้`,
            status: false,
          });
        } else {
          return res.send({
            message: "ลบผู้ใช้งานนี้เรียบร้อยเเล้ว",
            status: true,
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          message: "ไม่สามารถลบผู้ใช้งานนี้ได้",
          status: false,
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "ไม่สามารถลบผู้ใช้งานนี้ได้",
      status: false,
    });
  }
};
