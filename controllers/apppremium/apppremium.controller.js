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
            const invoice = await GenerateRiceiptNumber(req.body.shop_type, req.body.shop_id, shop.shop_number);
            let obj = [];
            let cost_tg = 0;
            let cost = 0;
            let total = 0;
            let total_platform = 0;
            let p_id;
            for (let item of req.body.product_detail) {
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
                cost += (item.agent_price * item.quantity);
                cost_tg += (item.pricevip * item.quantity);
                total += (item.price * item.quantity);
                total_platform += (total - cost_tg);
                await axios.request(config).then((res) => {
                    p_id = res.data.p_id;
                    const o = {
                        employee_id: req.body.employee,
                        shop_id: req.body.shop_id,
                        purchase_id: String(p_id),
                        invoice: invoice,
                        detail: item,
                        total: Number(total),
                        cost: Number(cost),
                        cost_tg: Number(cost_tg),
                        total_platform: Number(total_platform),
                        tossagun_tel: req.body.platform,
                        order_status: 'สั่งซื้อสินค้าสำเร็จ',
                        timestamp: dayjs(Date.now()).format(),
                    };
                    obj.push(o);
                }).catch((err) => {
                    console.log(err)
                })
            };

            const v = {
                shop_id: req.body.shop_id,
                platform: req.body.platform,
                invoice: invoice,
                total: Number(total),
                total_cost: Number(cost),
                total_cost_tg: Number(cost_tg),
                total_platform: Number(total_platform),
                payment_type: req.body.paymenttype,
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
            const findShop = await Shops.findByIdAndUpdate(req.body.shop_id, {
                $inc: {
                    shop_wallet: -total
                }
            }, { new: true })
            if (!findShop) {
                return res.status(404).send({ status: false, message: "ไม่สามารถค้นหาร้านที่ท่านระบุได้" })
            }

            const getteammember = await GetTeamMember(req.body.platform);
            if (!getteammember) {
                return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
            } else {
                let before = findShop.shop_wallet + total
                let doto = {
                    shop_id: findShop._id,
                    maker_id: req.body.maker_id,
                    orderid: createOrder._id,
                    name: `รายการสั่งซื้อ AppPremium ใบเสร็จเลขที่ ${invoice}`,
                    type: `เงินออก`,
                    category: 'Wallet',
                    amount: total,
                    before: before,
                    after: findShop.shop_wallet,
                    timestamp: dayjs(Date.now()).format(""),
                };

                const record = await WalletHistory.create(doto)
                if (!record) {
                    return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติการเงินได้" })
                }

                // จ่ายค่าคอมมิชชั่น
                const commissionData = await commissions.Commission(createOrder, total_platform, getteammember, 'AppPremium');
                const commission = new Commission(commissionData);
                if (!commission) {
                    return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
                } else {
                    commission.save();
                }
                return res.status(200).send({ status: true, record: record, shop: findShop.shop_wallet, invoice: invoice })
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

async function GenerateRiceiptNumber(shop_type, id, number) {
    if (shop_type === 'One Stop Service') {
        const pipelint = [
            {
                $match: { shop_type: shop_type },
            },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const count = await OrderServiceModels.aggregate(pipelint);
        const countValue = count.length > 0 ? count[0].count + 1 : 1;
        const data = `TG${dayjs(Date.now()).format("YYMM")}${countValue
            .toString()
            .padStart(3, "0")}`;
        return data;
    } else if (shop_type === 'One Stop Platform') {
        const pipelint = [
            {
                $match: { shop_type: shop_type },
            },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const count = await OrderServiceModels.aggregate(pipelint);
        const countValue = count.length > 0 ? count[0].count + 1 : 1;
        const data = `PF${dayjs(Date.now()).format("YYMM")}${countValue
            .toString()
            .padStart(3, "0")}`;
        return data;
    }
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