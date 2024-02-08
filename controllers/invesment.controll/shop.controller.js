const {
  InvesmentShops,
  validate,
} = require("../../model/invesment/invesment.shop.model");
const dayjs = require("dayjs");
const multer = require("multer");
const fs = require("fs");
const {google} = require("googleapis");
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
    // console.log(file.originalname);
  },
});

exports.create = async (req, res) => {
  try {
    let upload = multer({storage: storage}).array("invesment_detail", 20);
    upload(req, res, async function (err) {
      if (!req.files) {
        const {error} = validate(req.body);
        if (error)
          return res.status(400).send({message: error.details[0].message});
      } else if (err instanceof multer.MulterError) {
        return res.send(err);
      } else if (err) {
        return res.send(err);
      } else {
        uploadFileCreate(req, res);
      }
    });

    async function uploadFileCreate(req, res) {
      const filePath = [];
      const amount = req.files.length;
      console.log(req.files);
      for (let i = 0; i < amount; i++) {
        // filePath.push(req.files[i].path);
        let fileMetaData = {
          name: req.files[i].originalname,
          parents: [process.env.GOOGLE_DRIVE_IMAGE_LAND],
        };
        let media = {
          body: fs.createReadStream(req.files[i].path),
        };
        try {
          const response = await drive.files.create({
            resource: fileMetaData,
            media: media,
          });
          generatePublicUrl(response.data.id);
          filePath.push(response.data.id);
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .send({message: "Internal Server Error", status: false});
        }
      }
      const {error} = validate(req.body);
      const invoice = await invoiceNumber(req.body.timestamp);
      if (error)
        return res.status(400).send({message: error.details[0].message});
      const data = {
        ...req.body,
        invoice: invoice,
        invesment_detail: filePath,
        status: {
          status: "รอตรวจสอบ",
          timestamp: dayjs(Date.now()).format(""),
        },
        timestamp: dayjs(Date.now()).format(""),
      };
      const invesment = await InvesmentShops.create(data);
      return res.status(201).send({
        message: "สร้างรายงานใหม่เเล้ว",
        status: true,
        data: invesment,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({message: "Internal Server Error", status: false});
  }
};

// อัพเดตข้อมูลการแจ้งลงทุน;
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updateStatus = await InvesmentShops.findOne({_id: id});
    if (updateStatus) {
      updateStatus.employee = req.body.employee;
      updateStatus.status.push({
        status: "อยู่ระหว่างดำเนินการเปิดร้าน",
        timestamp: dayjs(Date.now()).format(""),
      });
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "ยืนยันการตรวจสอบการลงทุนสำเร็จ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
    }
    // if (
    //   !(
    //     req.body.status !== "รอตรวจสอบ" ||
    //     req.body.status !== "ตรวจสอบสำเร็จ" ||
    //     req.body.status !== "ยกเลิก"
    //   )
    // ) {
    //   return res.status(400).send({
    //     status: false,
    //     message:
    //       "status : จะต้องเป็น รอตรวจสอบ, ตรวจสอบสำเร็จ, ยกเลิก เท่านั้น",
    //   });
    // }
    // if (req.body.status === "ยกเลิก" && !req.body.remark) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "กรณียกเลิก จะต้องมี Remark หรือ เหตุผลที่ยกเลิก",
    //   });
    // }
    // const topup_wallet = await TopupWallet.findByIdAndUpdate(id, req.body);
    // if (topup_wallet) {
    //   const partner = await Partners.findById(topup_wallet.partner_id);
    //   console.log(partner);
    //   const history_data = {
    //     shop_id: topup_wallet.shop_id,
    //     partner_id: topup_wallet.partner_id,
    //     orderid: `เติมเงินแนบสลิป เลขที่ ${topup_wallet.invoice}`,
    //     type: "เงินเข้า",
    //     before: partner.partner_wallet,
    //     after: partner.partner_wallet + topup_wallet.amount,
    //     amount: topup_wallet.amount,
    //     name: `เงินเข้ากระเป๋าสุทธิ ${topup_wallet.amount} บาท`,
    //     timestamp: dayjs(Date.now()).format(""),
    //   };
    //   const new_history = new WalletHistory(history_data);
    //   new_history.save();
    //   return res
    //     .status(200)
    //     .send({status: true, message: "อัพเดตข้อมูลสำเร็จ"});
    // } else {
    //   return res
    //     .status(400)
    //     .send({status: false, message: "อัพเดตข้อมูลไม่สำเร็จ"});
    // }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

// อัพเดตข้อมูลการแจ้งลงทุน;
exports.cancel = async (req, res) => {
  try {
    const id = req.params.id;
    const updateStatus = await InvesmentShops.findOne({_id: id});
    if (updateStatus) {
      updateStatus.employee = req.body.employee;
      updateStatus.status.push({
        status: "ไม่ผ่านเกณฑ์การลงทุน",
        timestamp: dayjs(Date.now()).format(""),
      });
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "ยืนยันการตรวจสอบการลงทุนสำเร็จ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

//ค้นหาและสร้างเลข invoice
async function invoiceNumber(date) {
  const order = await InvesmentShops.find();
  let invoice_number = null;
  if (order.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `${dayjs(date).format("YYYYMM")}`.padEnd(13, "0") + num;
      check = await InvesmentShops.find({invoice: data});
      if (check.length === 0) {
        invoice_number =
          `${dayjs(date).format("YYYYMM")}`.padEnd(13, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    invoice_number = `${dayjs(date).format("YYYYMM")}`.padEnd(13, "0") + "1";
  }
  return invoice_number;
}

async function generatePublicUrl(res) {
  try {
    const fileId = res;
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });
    // console.log(result.data);
  } catch (error) {
    console.log(error.message);
  }
}

async function uploadFileCreate(req, res, {i, reqFiles}) {
  const filePath = req[i].path;
  let fileMetaData = {
    name: req.originalname,
    parents: [process.env.GOOGLE_DRIVE_IMAGE_LAND],
  };
  let media = {
    body: fs.createReadStream(filePath),
  };
  try {
    const response = await drive.files.create({
      resource: fileMetaData,
      media: media,
    });

    generatePublicUrl(response.data.id);
    reqFiles.push(response.data.id);
    console.log(response.data.id);
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"});
  }
}
