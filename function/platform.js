const axios = require("axios");

async function GetMember(tel, token) {
  const config = {
    method: "get",
    headers: {"auth-token": `Bearer ${token}`},
    url: `${process.env.TOSSAGUN_PLATFORM}/Shop/memberShop/${tel}`,
  };
  let response;
  await axios(config)
    .then((res) => {
      response = res.data;
    })
    .catch((err) => {
      response = err.response.data;
    });
  return response;
}
async function Register(packageData, token) {
  const config = {
    method: "post",
    headers: {"auth-token": `Bearer ${token}`},
    url: `${process.env.TOSSAGUN_PLATFORM}/Shop/regisMember`,
    data: packageData,
  };
  let response;
  await axios(config)
    .then((res) => {
      response = res.data;
    })
    .catch((err) => {
      response = err.response.data;
    });
  return response;
}

async function GetToken() {
  const config = {
    method: "post",
    headers: {},
    url: `${process.env.TOSSAGUN_PLATFORM}/Shop/genPublicToken`,
  };
  const response = await axios(config);
  return response.data;
}

module.exports = {GetMember, Register, GetToken};
