const axios = require("axios");
const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { OrderFlightTicket } = require("../../model/AOC/api.service.models/aoc.tricket.model");
const { Members } = require("../../model/user/member.model");
const { Percents } = require("../../model/pos/commission/percent.model");
const { Commission } = require("../../model/pos/commission/commission.model");
const { WalletHistory } = require("../../model/wallet/wallet.history.model");

const line = require("../../lib/line.notify");

dayjs.extend(utc);
dayjs.extend(timezone);

let Token

// ฟังก์ชันที่ใช้ในการเรียก API
async function getToken() {
  try {
    const token = await axios.post(process.env.AOC_URL + "Token", {
      username: process.env.AOC_USERNAME,
      password: process.env.AOC_PASSWORD,
      grantType: "password",
    });
    const fetchedToken = token.data;
    if (fetchedToken) {
      Token = fetchedToken.accessToken;
      // console.log(Token)
      return { status: true, data: Token };
    } else {
      return { message: "ดึงข้อมูลไม่สำเร็จ", status: false };
    }
  } catch (error) {
    console.error("Error calling API:", error);
  }
}

// ฟังก์ชันที่ใช้ในการเรียก getToken() เวลา 00:00:00 (เวลาประเทศไทย)
async function callTokenAPI() {
  const currentTime = dayjs().tz('Asia/Bangkok');
  const dayTime = currentTime.format('HH:mm:ss');
  // console.log(dayTime);
  // await getToken();
  if (currentTime.hour() === 0 && currentTime.minute() === 0 && currentTime.second() === 0) {
    // console.log("Calling getToken() at 00:00:00 Bangkok time");
    await getToken();
  }
}

// เรียกใช้งานฟังก์ชัน callTokenAPI() ทุกๆ 1 นาที
setInterval(callTokenAPI, 60000); // 1 นาที = 60000 มิลลิวินาที

// เรียกใช้ getToken() ทันทีหลังการ pull โค้ดขึ้นมาครั้งแรก
getToken();

//get ticket
exports.getFlightTicket = async (req, res) => {
  try {
    // console.log(Token)
    const ticketFlight = await axios.post(
      process.env.AOC_URL + "FlightSearchMultiTicket", {
      ...req.body,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    });
    // console.log(ticketFlight)
    const ticketFlight_data = ticketFlight.data.flights;
    if (ticketFlight_data) {
      if (req.body.tripType === "R") {
        const ticket = ticketFlight_data.filter(
          (el) => el.isMultiTicket === false
        );
        return res.status(200).send({
          status: true,
          origin_data: req.body,
          data: ticket,
          pgSearchOID: ticketFlight.data.pgSearchOID,
        });
      } else {
        const ticket = ticketFlight_data.filter(
          (el) => el.isMultiTicket === true
        );
        return res.status(200).send({
          status: true,
          origin_data: req.body,
          data: ticket,
          pgSearchOID: ticketFlight.data.pgSearchOID,
        });
      }
    } else {
      return res
        .status(400)
        .send({ message: "ดึงข้อมูลเที่ยวบินไม่สำเร็จ", status: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
};

//get Price Ticket
exports.getPriceTicket = async (req, res) => {
  try {
    const ticketPrice = await axios.post(
      process.env.AOC_URL + "FlightMultiTicketPricing", {
      ...req.body,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    });
    const ticketPrice_data = ticketPrice.data;
    if (ticketPrice_data) {
      return res.status(200).send({ message: "ดึงข้อมูลราคาเที่ยวบินสำเร็จ", status: true, data: ticketPrice_data });
    } else {
      return res.status(400).send({ message: "ดึงข้อมูลเที่ยวบินไม่สำเร็จ", status: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const flight_booking = await axios.post(
      process.env.AOC_URL + "FlightBooking", {
      ...req.body.aoc,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    });
    if (!flight_booking.data.TransactionID) {
      return res.status(401).send({ status: false, message: "จองตั๋วไม่สำเร็จ" });
    }
    const invoice = await GenerateRiceiptNumber();
    let data;
    let wallet;
    let newwallet;
    if (req.body.shop_type === 'One Stop Platform') {
      data = {
        maker_id: req.body.maker_id,
        invoice: invoice,
        transaction_id: flight_booking.data.TransactionID,
        contactInfo: req.body.aoc.contactInfo,
        total_cost: req.body.aoc.totalFare - req.body.aoc.totalCommission,
        total_commission: req.body.aoc.totalCommission,
        total: req.body.aoc.totalFare,
        shop_type: req.body.shop_type,
        platform: req.body.platform,
        status: {
          name: "รอดำเนินการออกตั๋ว",
          timestamp: dayjs(Date.now()).format(""),
        },
        timestamp: dayjs(Date.now()).format(""),
      }
      const member = await Members.findOne({ _id: req.body.maker_id });
      wallet = member.wallet;
      newwallet = member.wallet - req.body.aoc.totalFare;
      await Members.findByIdAndUpdate(member._id, { wallet: newwallet }, { useFindAndModify: false, });
    } else if (req.body.shop_type === 'One Stop Service') {

    }
    const getteammember = await GetTeamMember(req.body.platform);
    const new_ticket = new OrderFlightTicket(data);
    if (!getteammember) {
      return res.status(401).send({ stauts: false, message: 'ไม่พบข้อมูลลูกค้า' })
    } else {
      new_ticket.save();
      const orderid = await OrderFlightTicket.findOne({ _id: new_ticket._id });

      const code = "Service";
      const percent = await Percents.findOne({ code: code });
      const commisstion = req.body.aoc.totalCommission;
      const platfromcommission = (commisstion * percent.percent.platform) / 100;
      const bonus = (commisstion * percent.percent.terrestrial) / 100;
      const allSale = (commisstion * percent.percent.central) / 100;

      const validLevel = getteammember.filter((item) => item !== null);
      const storeData = [];

      // calculation from 80% for member
      const owner = (platfromcommission * percent.percent_platform.level_owner) / 100;
      const lv1 = (platfromcommission * percent.percent_platform.level_one) / 100;
      const lv2 = (platfromcommission * percent.percent_platform.level_two) / 100;
      const lv3 = (platfromcommission * percent.percent_platform.level_tree) / 100;

      // calculation vat 3%
      const ownervat = (owner * 3) / 100;
      const lv1vat = (lv1 * 3) / 100;
      const lv2vat = (lv2 * 3) / 100;
      const lv3vat = (lv3 * 3) / 100;

      // real commission for member
      const ownercommission = owner - ownervat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
      const lv1commission = lv1 - lv1vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
      const lv2commission = lv2 - lv2vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
      const lv3commission = lv3 - lv3vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน

      for (const TeamMemberData of validLevel) {
        let integratedData;
        if (TeamMemberData.level == "owner") {
          integratedData = {
            lv: TeamMemberData.level,
            iden: TeamMemberData.iden,
            name: TeamMemberData.name,
            address: `${TeamMemberData.address.address},${TeamMemberData.address.subdistrict},${TeamMemberData.address.district},${TeamMemberData.address.province},${TeamMemberData.address.postcode}`,
            tel: TeamMemberData.tel,
            commission_amount: owner,
            vat3percent: ownervat,
            remainding_commission: ownercommission,
          };
        }
        if (TeamMemberData.level == "1") {
          integratedData = {
            lv: TeamMemberData.level,
            iden: TeamMemberData.iden,
            name: TeamMemberData.name,
            address: `${TeamMemberData.address.address},${TeamMemberData.address.subdistrict},${TeamMemberData.address.district},${TeamMemberData.address.province},${TeamMemberData.address.postcode}`,
            tel: TeamMemberData.tel,
            commission_amount: lv1,
            vat3percent: lv1vat,
            remainding_commission: lv1commission,
          };
        }
        if (TeamMemberData.level == "2") {
          integratedData = {
            lv: TeamMemberData.level,
            iden: TeamMemberData.iden,
            name: TeamMemberData.name,
            address: `${TeamMemberData.address.address},${TeamMemberData.address.subdistrict},${TeamMemberData.address.district},${TeamMemberData.address.province},${TeamMemberData.address.postcode}`,
            tel: TeamMemberData.tel,
            commission_amount: lv2,
            vat3percent: lv2vat,
            remainding_commission: lv2commission,
          };
        }
        if (TeamMemberData.level == "3") {
          integratedData = {
            lv: TeamMemberData.level,
            iden: TeamMemberData.iden,
            name: TeamMemberData.name,
            address: `${TeamMemberData.address.address},${TeamMemberData.address.subdistrict},${TeamMemberData.address.district},${TeamMemberData.address.province},${TeamMemberData.address.postcode}`,
            tel: TeamMemberData.tel,
            commission_amount: lv3,
            vat3percent: lv2vat,
            remainding_commission: lv3commission,
          };
        }
        if (integratedData) {
          storeData.push(integratedData);
        }
      }
      const commissionData = {
        data: storeData,
        platform: platfromcommission,
        bonus: bonus,
        allSale: allSale,
        orderid: new_ticket._id,
        code: "Tricket",
        timestamp: dayjs(Date.now()).format(""),
      };
      const commission = new Commission(commissionData);
      if (commission) {
        commission.save();
        let wallethistory;
        if (req.body.shop_type === 'One Stop Platform') {
          wallethistory = {
            maker_id: req.body.maker_id,
            orderid: new_ticket._id,
            name: `รายการสั่งจองตั๋วเครื่องบินใบเสร็จเลขที่ ${new_ticket.invoice}`,
            type: "เงินออก",
            before: wallet,
            after: newwallet,
            amount: new_ticket.total,
            timestamp: dayjs(Date.now()).format(""),
          }
        }
        const walletHistory = new WalletHistory(wallethistory);
        walletHistory.save();
        const message = `
แจ้งงานเข้า : จองตั๋วเครื่องบิน
เลขที่ทำรายการ : ${new_ticket.invoice}
เลขอ้างอิง : ${new_ticket.transaction_id}
ตรวจสอบได้ที่ : https://shop-admin.tossaguns.com/
        
*ฝากแอดมินรบกวนตรวจสอบด้วยนะคะ/ครับ*`
        await line.linenotify(message);
        return res.status(200).send({ status: true, message: 'ทำรายการสำเร็จ', data: new_ticket })
      } else {
        console.error(error);
        return res.status(403).send({
          message: "ไม่สามารถบันทึกได้",
          error: error.message,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.getFlightBooking = async (req, res) => {
  try {

    const FlightBooking = await axios.post(
      process.env.AOC_URL + "GetFlightBooking",
      {
        bookingKeyReference: req.body.bookingKeyReference,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    const data = FlightBooking.data;
    if (data) {
      return res.status(200).send({
        message: "ดึงข้อมูลตั๋วเครื่องบินสำเร็จ",
        status: true,
        data: data,
      });
    } else {
      return res
        .status(400)
        .send({ message: "ดึงข้อมูลตั๋วเครื่องบินไม่สำเร็จ", status: false });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.updatePayment = async (req, res) => {
  try {

    const payment = await axios.post(
      process.env.AOC_URL + "UpdatePayment",
      {
        ...req.body,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    console.log(payment);

    const data = payment.data;
    if (data) {
      return res.status(200).send({
        message: "บันทึกข้อมูลสำเร็จ",
        status: true,
        data: data,
      });
    } else {
      return res
        .status(400)
        .send({ message: "บันทึกข้อมูลไม่สำเร็จ", status: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

exports.confirmAOC = async (req, res) => {
  try {
    const id = req.params.id;
    const updateStatus = await OrderFlightTicket.findOne({ _id: id });
    if (updateStatus) {
      updateStatus.shop_id = req.body.shop_id;
      updateStatus.platform = req.body.platform;
      updateStatus.employee = req.body.employee;
      updateStatus.status.push({
        name: "ยืนยัน",
        timestamp: dayjs(Date.now()).format(""),
      });
      updateStatus.save();
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
    return res.status(200).send({
      status: true,
      message: "คอนเฟิร์มออร์เดอร์สำเร็จ",
      data: updateStatus,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
};

async function GenerateRiceiptNumber() {
  const order_ticket = await OrderFlightTicket.find();
  const count = order_ticket.lenght > 0 ? order_ticket[0].count + 1 : 1;
  const data = `AOC${dayjs(Date.now()).format("YYMMDD")}${count
    .toString()
    .padStart(5, "0")}`;
  return data;
};

async function GetTeamMember(tel) {
  try {
    const member = await Members.findOne({ tel: tel });
    if (!member) {
      return res
        .status(403)
        .send({ message: "เบอร์โทรนี้ยังไม่ได้เป็นสมาชิกของทศกัณฐ์แฟมมิลี่" });
    } else {
      const upline = [member.upline.lv1, member.upline.lv2, member.upline.lv3];
      const validUplines = upline.filter((item) => item !== "-");
      const uplineData = [];
      let i = 0;
      for (const item of validUplines) {
        const include = await Members.findOne({ _id: item });
        if (include !== null) {
          uplineData.push({
            iden: include.iden.number,
            name: include.fristname,
            address: {
              address: include.address,
              subdistrict: include.subdistrict,
              district: include.district,
              province: include.province,
              postcode: include.postcode,
            },
            tel: include.tel,
            level: i + 1,
          });
          i++;
        }
      }
      const owner = {
        iden: member.iden.number,
        name: member.fristname,
        address: {
          address: member.address,
          subdistrict: member.subdistrict,
          district: member.district,
          province: member.province,
          postcode: member.postcode,
        },
        tel: member.tel,
        level: "owner",
      };
      const data = [
        owner || null,
        uplineData[0] || null,
        uplineData[1] || null,
        uplineData[2] || null,
      ];
      return data
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: false, error: error.message });
  }
};

exports.getOrderAll = async (req, res) => {
  try {
    const order = await OrderFlightTicket.find();
    if (!order)
      return res.status(403).send({ status: false, message: 'ดึงข้อมูลไม่สำรเร็จ' });
    return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: order });
  } catch (error) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
};

exports.getOrderByMakerId = async (req, res) => {
  try {
    const id = req.params.makerid;
    const order = await OrderFlightTicket.find();
    const orders = order.filter(
      (el) => el.maker_id === id
    );
    if (!orders)
      return res.status(403).send({ status: false, message: 'ดึงข้อมูลไม่สำรเร็จ' });
    return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: orders });
  } catch (error) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
}