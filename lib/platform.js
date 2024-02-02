const axios = require("axios");

async function GetMember(tel) {
  const config = {
    method: "get",
    headers: {},
    url: `${process.env.TOSSAGUN_PLATFORM}/Member/CheckInvite/${tel}`,
  };
  const response = await axios(config);
  return response.data;
}

async function GetAllMember() {
  const config = {
    method: "get",
    headers: {},
    url: `${process.env.TOSSAGUN_PLATFORM}/Member/GetAllMember`,
  };
  const response = await axios(config);
  return response.data;
}

async function Register(packageData) {
  const config = {
    method: "post",
    headers: {},
    url: `${process.env.TOSSAGUN_PLATFORM}/Member/create`,
    data: packageData,
  };
  const response = await axios(config);
  return response.data;
}

module.exports = {GetMember, GetAllMember, Register};
