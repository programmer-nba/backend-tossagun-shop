const axios = require("axios");

async function GetContractPDPA() {
  const code = 'PDPA'
  const config = {
    method: 'GET',
    headers: {},
    url: `${process.env.OFFICE_URL}/lawyer/${code}/one`,
  };
  const response = await axios(config);
  return response.data;
}

module.exports = { GetContractPDPA };
