const axios = require("axios");

async function GetContract() {
  const config = {
    method: "get",
    headers: {},
    url: `${process.env.TOSSAGUN_CONTRACT}/HaveplaceNocapital/GetAllContractByCode`,
  };
  const response = await axios(config);
  return response.data;
}

async function createContract(packageData) {
  const config = {
    method: "post",
    headers: {},
    url: `${process.env.TOSSAGUN_CONTRACT}/HaveplaceNocapital/createCode`,
    data: packageData,
  };
  const response = await axios(config);
  return response.data;
}

async function getByPartnerId(packageId) {
  const config = {
    method: "get",
    headers: {},
    url: `${process.env.TOSSAGUN_CONTRACT}/partner/getContract/${packageId}`,
  };
  const response = await axios(config);
  return response.data;
}
module.exports = {GetContract, createContract, getByPartnerId};
