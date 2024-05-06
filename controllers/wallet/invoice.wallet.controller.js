const dayjs = require("dayjs");
const {
    TopupWallet,
    validate,
} = require("../../model/wallet/topup.wallet.model");

exports.create = async (req, res) => {
    console.log(req.body);
    try {
        TopupWallet.find().then((value) => {
            console.log(value);
            if (!value) {
                return res.status(404);
            } else {
                console.log("ค่าที่รีเทอนกลับมา =>>>>>>> ", value);
                if (value.length < 9) {
                    return res.send({
                        status: true,
                        invoice: `TS${dayjs(Date.now()).format("YYYYMM")}0000${value.length + 1}`,
                    });
                }
                else if (value.length < 99) {
                    return res.send({
                        status: true,
                        invoice: `TS${dayjs(Date.now()).format("YYYYMM")}000${value.length + 1
                            }`,
                    });
                } else if (value.length < 999) {
                    return res.send({
                        status: true,
                        invoice: `TS${dayjs(Date.now()).format("YYYYMM")}00${value.length + 1
                            }`,
                    });
                } else if (value.length < 9999) {
                    return res.send({
                        status: true,
                        invoice: `TS${dayjs(Date.now()).format("YYYYMM")}0${value.length + 1
                            }`,
                    });
                } else if (value.length < 99999) {
                    return res.send({
                        status: true,
                        invoice: `TS${dayjs(Date.now()).format("YYYYMM")}${value.length + 1}`,
                    });
                }
            }
        });
    } catch (error) {
        res.status(500).send({
            message: "มีบางอย่างผิดพลาด",
            status: false,
        });
    }
};
