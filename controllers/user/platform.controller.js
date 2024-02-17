const platform = require("../../function/platform");

exports.checkMember = async (req, res) => {
  try {
    const token = await platform.GetToken();
    const tel = req.params.tel;
    const response = await platform.GetMember(tel, token.token);
    if (response.status === true) {
      return res.status(200).send(response.data);
    } else {
      return res.status(201).send(response.data);
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

exports.getMember = async (req, res) => {
  try {
    const response = await platform.GetMemberAll();
    if (response.status === true) {
      return res.status(200).send(response.data)
    } else {
      return res.status(201).send(response.data)
    }
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
}
