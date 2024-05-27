const contract = require("../../function/contract");

exports.getContractPDPA = async (req, res) => {
  try {
    const response = await contract.GetContractPDPA();
    if (response.status === true) {
      return res.status(200).send(response.data);
    } else {
      return res.status(201).send(response.data);
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

exports.getContractCondition = async (req, res) => {
  try {
    const response = await contract.GetContractCondition();
    if (response.status === true) {
      return res.status(200).send(response.data);
    } else {
      return res.status(201).send(response.data);
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}