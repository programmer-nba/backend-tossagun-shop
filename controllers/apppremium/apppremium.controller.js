const axios = require("axios");
const dayjs = require("dayjs");
const { Shops } = require("../../model/pos/shop.model");
const { OrderServiceModels } = require("../../model/service/order/order.model");
const { Members } = require("../../model/user/member.model");
const commissions = require("../../function/commission");
const { Commission } = require("../../model/pos/commission/commission.model");
const { AppPremiumBooking } = require("../../model/apppremium/apppremium.model");
const { WalletHistory } = require("../../model/wallet/wallet.history.model");
const { OrderApppremium } = require("../../model/apppremium/order.apppremium.model");
const { PercentApppremium } = require("../../model/apppremium/apppremium.percent.model");

module.exports.getProductAll = async (req, res) => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${process.env.APPPREMIUM_URL}api_product`,
            headers: {
                'Cookie': 'PHPSESSID=92h3fpmr45vidrb1albn4e8uhr'
            }
        };

        await axios.request(config).then((response) => {
            // console.log(JSON.stringify(response.data));
            // console.log(response.data)
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: response.data });
        }).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
};

module.exports.createOrder = async (req, res) => {
    try {
        // console.log(req.body);
        if (req.body.shop_type === 'One Stop Service') {
            await checkEmployee(req, res);
        } else {
            comsole.log('ยังไม่พร้อมใช้งาน')
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
};

const checkEmployee = async (req, res) => {
    try {
        const shop = await Shops.findOne({ _id: req.body.shop_id });
        if (!shop) {
            return res.status(403).send({ message: "ไม่พบข้อมูลร้านค้า" });
        } else {
            if (shop.shop_status === false) {
                return res.status(403).send({ message: "ร้านค้าดังกล่าวไม่สามารถทำรายการได้" });
            }

            const invoice = await invoiceNumber();
            let obj = [];
            let p_id;

            // let cost_tg = 0;
            // let cost = 0;
            // let total = 0;
            // let total_platform = 0;
            // let profit = 0;
            // let profit_tg = 0;
            // let profit_shop = 0;
            for (let item of req.body.product_detail) {
                // console.log(item)
                const p = await PercentApppremium.findOne({ type: item.c_type });
                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: `${process.env.APPPREMIUM_URL}apibuy_product`,
                    headers: {
                        'apikey': `${process.env.APPPREMIUM_KEY}`,
                        'Cookie': 'PHPSESSID=92h3fpmr45vidrb1albn4e8uhr',
                        'customer': invoice,
                        'pid': item.id
                    }
                };
                const total = (item.price * item.quantity);
                const cost = (item.agent_price * item.quantity);
                const profit = total - cost;
                const profit_tg = profit * (p.profit_tg / 100);
                const profit_shop = profit * (p.profit_shop / 100);
                const total_platform = profit * (p.platform / 100);
                await axios.request(config).then((result) => {
                    p_id = result.data.p_id;
                    const o = {
                        employee_id: req.body.employee,
                        shop_id: req.body.shop_id,
                        purchase_id: String(p_id),
                        invoice: invoice,
                        detail: item,
                        total: Number(total.toFixed(2)),
                        cost: Number(cost.toFixed(2)),
                        profit: Number(profit.toFixed(2)),
                        profit_tg: Number(profit_tg.toFixed(2)),
                        profit_shop: Number(profit_shop.toFixed(2)),
                        total_platform: Number(total_platform.toFixed(2)),
                        tossagun_tel: req.body.platform,
                        order_status: result.data.msg,
                        timestamp: dayjs(Date.now()).format(),
                    };
                    obj.push(o);
                });
            };

            if (!p_id) {
                return res.status(403).send({ status: false, message: 'ทำรายการไม่สำเร็จ กรุณาติดต่อแอดมิน' })
            }

            const total_net = obj.reduce((sum, el) => sum + el.total, 0);
            const total_cost = obj.reduce((sum, el) => sum + el.cost, 0);
            const total_profit = obj.reduce((sum, el) => sum + el.profit, 0);
            const total_profit_tg = obj.reduce((sum, el) => sum + el.profit_tg, 0);
            const total_profit_shop = obj.reduce((sum, el) => sum + el.profit_shop, 0);
            const total_platform = obj.reduce((sum, el) => sum + el.total_platform, 0);

            const v = {
                shop_id: req.body.shop_id,
                platform: req.body.platform,
                invoice: invoice,
                customer_name: req.body.customer_name,
                customer_tel: req.body.customer_tel,
                customer_line: req.body.customer_line,
                total: Number(total_net.toFixed(2)),
                total_cost: Number(total_cost.toFixed(2)),
                total_profit: Number(total_profit.toFixed(2)),
                total_profit_tg: Number(total_profit_tg.toFixed(2)),
                total_profit_shop: Number(total_profit_shop.toFixed(2)),
                total_platform: Number(total_platform.toFixed(2)),
                payment_type: req.body.paymenttype,
                moneyreceive: req.body.moneyreceive,
                change: req.body.change,
                discount: req.body.discount,
                purchase_id: String(p_id),
                product: obj,
                employee: req.body.employee,
                status: [
                    { name: "ชำระเงิน", timestamp: dayjs(Date.now()).format() }
                ],
                timestamp: dayjs(Date.now()).format(),
            };

            const createOrder = await OrderApppremium.create(v);
            const createOrderApppremium = await AppPremiumBooking.insertMany(obj);
            if (!createOrderApppremium && !createOrder) {
                console.log("ไม่สามารถสร้างข้อมูลสั่งซื้อได้")
            }

            // ตัดเงิน
            const wallet = (shop.shop_wallet - total_net) + total_profit_shop;
            shop.shop_wallet = wallet;
            shop.save();
            console.log('ปรับยอดในกระเป่าสำเร็จ')

            const getteammember = await GetTeamMember(req.body.platform);
            if (!getteammember) {
                return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
            } else {

                let doto1 = {
                    shop_id: shop._id,
                    maker_id: req.body.maker_id,
                    orderid: createOrder._id,
                    name: `รายการสั่งซื้อ AppPremium ใบเสร็จเลขที่ ${invoice}`,
                    type: `เงินออก`,
                    category: 'Wallet',
                    amount: total_net,
                    before: (shop.shop_wallet + total_net) - total_profit_shop,
                    after: shop.shop_wallet - total_profit_shop,
                    timestamp: dayjs(Date.now()).format(""),
                };

                const record1 = await WalletHistory.create(doto1)
                if (!record1) {
                    return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติเงินเข้าได้" })
                }


                let doto2 = {
                    shop_id: shop._id,
                    maker_id: req.body.maker_id,
                    orderid: createOrder._id,
                    name: `รายการสั่งซื้อ AppPremium ใบเสร็จเลขที่ ${invoice}`,
                    type: `เงินเข้า`,
                    category: 'Income',
                    amount: total_profit_shop,
                    before: shop.shop_wallet - total_profit_shop,
                    after: shop.shop_wallet,
                    timestamp: dayjs(Date.now()).format(""),
                };

                const record2 = await WalletHistory.create(doto2)
                if (!record2) {
                    return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติเงินเข้าได้" })
                }

                // จ่ายค่าคอมมิชชั่น
                const commissionData = await commissions.Commission(createOrder, total_platform, getteammember, 'AppPremium', total_net);
                const commission = new Commission(commissionData);
                if (!commission) {
                    return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
                } else {
                    commission.save();
                }
                return res.status(200).send({ status: true, data: createOrder, shop: shop.shop_wallet, invoice: invoice })
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

async function invoiceNumber() {
    const pipelint = [
        {
            $group: { _id: 0, count: { $sum: 1 } },
        },
    ];
    const count = await OrderApppremium.aggregate(pipelint);
    const countValue = count.length > 0 ? count[0].count + 1 : 1;
    const data = `APP${dayjs(Date.now()).format("YYMMDD")}${countValue.toString().padStart(3, "0")}`;
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