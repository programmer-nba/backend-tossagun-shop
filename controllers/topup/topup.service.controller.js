const dayjs = require("dayjs");
const { OrderTopup } = require("../../model/topup/order.topup");
const { PercentTopup } = require("../../model/topup/topup.percent");
const { Members } = require("../../model/user/member.model");
const { AWSBooking } = require("../../model/topup/aws.order");
const { WalletHistory } = require("../../model/wallet/wallet.history.model");
const { Commission } = require("../../model/pos/commission/commission.model");
const { Shops } = require("../../model/pos/shop.model");
const commissions = require("../../function/commission");
const { default: axios } = require("axios");

module.exports.booking = async (req, res) => {
    try {
        const platform = await Members.findOne({ tel: req.body.platform });
        if (!platform) {
            return res.status(404).send({ status: false, message: 'คุณยังไม่ได้เป็นสมาชิกทศกัณฐ์แฟมิลี่' })
        }
        const invoice = await invoiceNumber();
        const ref_number = await runreference_order();
        const new_data = [];
        let commission = 0;
        let commission_tg = 0;
        let commission_shop = 0;
        let total = 0;
        let total_platform = 0;
        for (let item of req.body.product_detail) {
            const percent = await PercentTopup.findOne({ topup_id: item.service_id });

            const value = {
                reference_order: ref_number,
                amount: item.amount,
                branch: process.env.TOPUP_USERNAME,
                service_id: item.service_id,
                mobile: item.mobile,
                ref1: invoice,
            };

            const resp = await axios.post(`${process.env.TOPUP_URL}`, value, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.TOPUP_TOKEN}`
                },
            });

            if (resp.data.status === 'fail') {
                console.log('แจ้งเติมเงินไม่สำเร็จ')
                const v = {
                    ...item,
                    invoice: invoice,
                    ref_number: ref_number,
                    order_id: '',
                    commission: 0,
                    commission_tg: 0,
                    commission_shop: 0,
                    total_platform: 0,
                    shop_id: req.body.shop_id,
                    employee_id: req.body.employee,
                    type_payment: req.body.paymenttype,
                    tossagun_tel: req.body.platform,
                    order_status: resp.data.status,
                    timestamp: dayjs(Date.now()).format(),
                };
                new_data.push(v);
            }

            if (resp.data.status === 'success') {
                let com = 0;
                let com_tg = 0;
                let com_shop = 0;
                let platform = 0;
                if (item.type === 'WALLET') {
                    com = item.fee;
                    com_tg = com * (percent.profit_tg / 100);
                    com_shop = com * (percent.profit_shop / 100);
                    platform = com_tg * (percent.platform / 100);
                } else {
                    com = item.amount * (percent.percent / 100);
                    com_tg = com * (percent.profit_tg / 100);
                    com_shop = com * (percent.profit_shop / 100);
                    platform = com_tg * (percent.platform / 100);
                }
                const v = {
                    ...item,
                    invoice: invoice,
                    ref_number: ref_number,
                    order_id: resp.data.order_id,
                    commission: com,
                    commission_tg: com_tg,
                    commission_shop: com_shop,
                    total_platform: platform,
                    shop_id: req.body.shop_id,
                    employee_id: req.body.employee,
                    type_payment: req.body.paymenttype,
                    tossagun_tel: req.body.platform,
                    order_status: resp.data.message,
                    timestamp: dayjs(Date.now()).format(),
                };
                new_data.push(v);
                total += item.total;
                commission += com;
                commission_tg += com_tg;
                commission_shop += com_shop;
                total_platform += platform;
            }
        };

        const o = {
            shop_id: req.body.shop_id,
            platform: req.body.platform,
            invoice: invoice,
            ref_number: ref_number,
            total: Number(total.toFixed(2)),
            commission: Number(commission.toFixed(2)),
            commission_tg: Number(commission_tg.toFixed(2)),
            commission_shop: Number(commission_shop.toFixed(2)),
            total_platform: Number(total_platform.toFixed(2)),
            payment_type: req.body.paymenttype,
            moneyreceive: req.body.moneyreceive,
            change: req.body.change,
            product: new_data,
            employee: req.body.employee,
            status: [
                { name: "ชำระเงิน", timestamp: dayjs(Date.now()).format() }
            ],
            timestamp: dayjs(Date.now()).format(),
        };
        const createOrder = await OrderTopup.create(o);
        const createOrderAWS = await AWSBooking.insertMany(new_data);
        if (!createOrder && !createOrderAWS) {
            console.log("ไม่สามารถสร้างข้อมูล booking ได้")
        }

        const cost = total - commission_shop;
        // ตัดเงิน
        const findShop = await Shops.findByIdAndUpdate(req.body.shop_id, {
            $inc: { shop_wallet: -cost }
        }, { new: true })
        if (!findShop) {
            return res.status(404).send({ status: false, message: "ไม่สามารถค้นหาร้านที่ท่านระบุได้" })
        }

        const getteammember = await GetTeamMember(req.body.platform);
        if (!getteammember) {
            return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
        } else {
            let before = findShop.shop_wallet + total - commission_shop;
            let doto = {
                shop_id: findShop._id,
                maker_id: req.body.maker_id,
                orderid: createOrder._id,
                name: `รายการเติมเงินหมายเลขที่ ${invoice}`,
                type: `เงินออก`,
                category: 'Wallet',
                amount: total,
                before: before,
                after: findShop.shop_wallet - commission_shop,
                timestamp: dayjs(Date.now()).format(""),
            };
            const record = await WalletHistory.create(doto);
            if (!record) {
                return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติเงินออกได้" })
            }

            let doto1 = {
                shop_id: findShop._id,
                maker_id: req.body.maker_id,
                orderid: createOrder._id,
                name: `รายการขนส่งหมายเลขที่ ${invoice}`,
                type: `เงินเข้า`,
                category: 'Income',
                amount: commission_shop,
                before: findShop.shop_wallet - commission_shop,
                after: findShop.shop_wallet,
                timestamp: dayjs(Date.now()).format(""),
            }
            const record1 = await WalletHistory.create(doto1)
            if (!record1) {
                return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติเงินเข้าได้" })
            }

            const commissionData = await commissions.Commission(createOrder, total_platform, getteammember, 'Topup', total)
            const commission = new Commission(commissionData);
            if (!commission) {
                return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
            } else {
                commission.save();
            }
            return res.status(200).send({ status: true, data: o, record: record, shop: findShop.shop_wallet, invoice: invoice })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "เกิดข้อผิดพลาดบางอย่าง", data: error.data });
    }
};

module.exports.callback = async (req, res) => {
    try {
        console.log("ตอบกลับจาก AWS Topup");
        const order = await AWSBooking.findOne({ order_id: req.body.order_id });
        const order_tg = await OrderTopup.findOne({ ref_number: order.ref_number });
        if (req.body.transaction_status === 'TOP_SUCCESS') {
            order_tg.status.push({ name: "ดำเนินการสำเร็จ", timestamp: dayjs(Date.now()).format() })
        } else if (req.body.transaction_status === 'TOP_FAIL') {
            order_tg.status.push({ name: "ดำเนินการไม่สำเร็จ", timestamp: dayjs(Date.now()).format() })
        } else if (req.body.transaction_status === 'TOP_PENDING') {
            order_tg.status.push({ name: "รอดำเนินการ", timestamp: dayjs(Date.now()).format() })
        }
        await AWSBooking.findByIdAndUpdate(order._id, { order_status: req.body.transaction_status }, { useFindAndModify: false, });
        order_tg.save();
        console.log('บันทึกข้อมูลจากการตอกกลับ AWS สำเร็จ')
        // return res.status(200).send({ status: true, message: 'ทำรายการสำเร็จ' })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "เกิดข้อผิดพลาดบางอย่าง", data: error.data });
    }
};

async function invoiceNumber() {
    const pipelint = [
        {
            $group: { _id: 0, count: { $sum: 1 } },
        },
    ];
    const count = await OrderTopup.aggregate(pipelint);
    const countValue = count.length > 0 ? count[0].count + 1 : 1;
    const data = `TOPUP${dayjs(Date.now()).format("YYMMDD")}${countValue.toString().padStart(3, "0")}`;
    return data;
};

async function runreference_order() {
    // สุ่มเลขอ้างอิง 10 หลัก
    let reference_order = Math.floor(1000000000 + Math.random() * 9000000000);
    return reference_order;
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

module.exports.getBookingAll = async (req, res) => {
    try {
        const booking = await AWSBooking.find();
        if (!booking) {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' });
        } else {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: booking });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "เกิดข้อผิดพลาดบางอย่าง", data: error.data });
    }
};