const contract = require("../../function/contract");

exports.getContractAll = async (req, res) => {
  try {
    const response = await contract.GetContract();
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.createContract = async (req, res) => {
  try {
    const data = {
      name: req.body.contract_code,
      partner_id: req.body.contract_name,
      start_date: req.body.contract_timestamp,
      partner_signature: [
        {
          name: req.body.contract_name,
        },
      ],
    };
    const response = await contract.createContract(data);
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};

exports.getContractByPartnerId = async (req, res) => {
  try {
    const partner_id = req.params.partner_id;
    const response = await contract.getByPartnerId(partner_id);
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด", status: false});
  }
};
