const platform = require("../../function/platform");
const { Commission } = require("../../model/pos/commission/commission.model");
const jwt = require("jsonwebtoken");

exports.checkMember = async (req, res) => {
  try {
    const token = await platform.GetToken();
    const tel = req.params.tel;
    const response = await platform.GetMember(tel, token.token);
    if (response.status === true) {
      return res.status(200).send(response.data);
    } else {
      return res.status(201).send(response);
    }
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.getToken = async (req, res) => {
  try {
    const response = await platform.GetToken();
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.register = async (req, res) => {
  try {
    const token = await platform.GetToken();
    const new_address = {
      new_sub_address: req.body.address,
      new_subdistrict: req.body.subdistrict,
      new_district: req.body.district,
      new_province: req.body.province,
      new_postcode: req.body.postcode,
    };
    const data = {
      ...req.body,
      new_address: new_address,
    };
    const response = await platform.Register(data, token.token);
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.getTeammember = async (req, res) => {
  try {
    const token = await platform.GetToken();
    const tel = req.params.tel;
    const response = await platform.GetTeamMember(tel, token.token);
    if (response.status === true) {
      return res.status(200).send(response.data);
    } else {
      return res.status(201).send(response.data);
    }
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.getMemberAll = async (req, res) => {
  try {
    const response = await platform.GetMemberAll();
    if (response.status === true) {
      return res.status(200).send(response.data)
    } else {
      return res.status(201).send(response)
    }
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

//สร้างtoken
exports.genPublicToken = async (req, res) => {
  try {
    const token = jwt.sign(
      { code: "Platform", name: "platform", key: "platform_tossagun" },
      process.env.TOKEN_KEY
    );
    if (token) {
      return res.status(200).send({ status: true, token: token });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "สร้าง Token ไม่สำเร็จ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err.message });
  }
};

exports.getCommissionAll = async (req, res) => {
  try {
    let tel = req.params.tel;
    const pipeline = [
      {
        $unwind: "$data",
      },
      {
        $match: { "data.tel": tel },
      },
    ];
    const result = await Commission.aggregate(pipeline);
    if (!result)
      return res
        .status(403)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: result });
  } catch (err) {
    return res.status(500).send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
}