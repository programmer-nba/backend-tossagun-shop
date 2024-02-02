const platform = require("../../lib/platform");

exports.checkMember = async (req, res) => {
  try {
    const response = await platform.GetMember(req.body.tel_platform);
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.getAllMember = async (req, res) => {
  try {
    const response = await platform.GetAllMember();
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};