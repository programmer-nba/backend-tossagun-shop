const axios = require("axios");

async function GetMember(tel, token) {
  const config = {
    method: "get",
    headers: { "auth-token": `Bearer ${token}` },
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
    headers: { "auth-token": `Bearer ${token}` },
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

async function GetTeamMember(tel, token) {
  const config = {
    method: "get",
    headers: { "auth-token": `Bearer ${token}` },
    url: `${process.env.TOSSAGUN_PLATFORM}/Shop/memberTeam/${tel}`,
  };
  const response = await axios(config);
  return response.data;
}

async function GetMemberAll() {
  const config = {
    method: "get",
    headers: {},
    url: `${process.env.TOSSAGUN_PLATFORM}/Member/GetAllMember`,
  };
  let response;
  await axios(config)
    .then((res) => {
      response = res.data;
    })
    .catch((err) => {
      response = err.response.data;
    });
  console.log(response)
  return response;
}

async function Commission(packageData, token) {
  const config = {
    method: "put",
    headers: { "auth-token": `Bearer ${token}` },
    url: `${process.env.TOSSAGUN_PLATFORM}/Shop/update`,
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
  console.log(response)
  return response;
}

module.exports = { GetMember, Register, GetToken, GetTeamMember, GetMemberAll, Commission };
