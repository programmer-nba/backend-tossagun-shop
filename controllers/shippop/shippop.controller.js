const { Shops } = require("../../model/pos/shop.model");
const { customerShippop } = require("../../model/shippop/customer.model");
const { insuredExpress } = require("../../model/shippop/insured.model");
const { PercentCourier } = require("../../model/shippop/percent.model");
const { shippopBooking } = require("../../model/shippop/shippop.order");
const { OrderExpress } = require("../../model/shippop/order.express.model");
const axios = require("axios");
const { WalletHistory } = require("../../model/wallet/wallet.history.model");
const { Members } = require("../../model/user/member.model");
const dayjs = require("dayjs");
const commissions = require("../../function/commission");
const { Commission } = require("../../model/pos/commission/commission.model");
const { OrderBoxExpress } = require("../../model/shippop/order.box.model");

module.exports.priceList = async (req, res) => {
    try {
        const percent = await PercentCourier.find();
        const id = req.decoded.userid
        const weight = req.body.parcel.weight
        const declared_value = req.body.declared_value
        const formData = req.body
        const cod_amount = req.body.cod_amount
        const shop = req.body.shop_number

        if (weight == 0) {
            return res
                .status(400)
                .send({ status: false, message: "กรุณาระบุน้ำหนัก" })
        }

        if (!Number.isInteger(cod_amount) ||
            !Number.isInteger(declared_value)) {
            return res.status(400).send({
                status: false,
                message: `กรุณาระบุค่า COD หรือ มูลค่าสินค้า(ประกัน) เป็นจำนวนเต็มเท่านั้นห้ามใส่ทศนิยม`
            });
        }

        //ผู้ส่ง
        const sender = formData.origin;
        const filterSender = { shop_id: shop, tel: sender.tel, status: 'ผู้ส่ง' }; //เงื่อนไขที่ใช้กรองว่ามีใน database หรือเปล่า

        const data_sender = { //ข้อมูลที่ต้องการอัพเดท หรือ สร้างใหม่
            ...sender,
            status: 'ผู้ส่ง',
            postcode: String(sender.postcode),
        };

        const optionsSender = { upsert: true }; // upsert: true จะทำการเพิ่มข้อมูลถ้าไม่พบข้อมูลที่ตรงกับเงื่อนไข

        const resultSender = await customerShippop.updateOne(filterSender, data_sender, optionsSender);
        if (resultSender.upsertedCount > 0) {
            console.log('สร้างข้อมูลผู้ส่งคนใหม่');
        } else {
            console.log('อัปเดตข้อมูลผู้ส่งเรียบร้อย');
        }

        const infoSender = await customerShippop.findOne(filterSender)
        if (!infoSender) {
            console.log('ไม่มีข้อมูลผู้ส่ง')
        }

        //ผู้รับ
        const recipient = formData.to; // ผู้รับ
        const filter = { shop_id: id, tel: recipient.tel, status: 'ผู้รับ' }; //เงื่อนไขที่ใช้กรองว่ามีใน database หรือเปล่า

        const update = { //ข้อมูลที่ต้องการอัพเดท หรือ สร้างใหม่
            ...recipient,
            status: 'ผู้รับ',
            postcode: String(recipient.postcode),
        };

        const options = { upsert: true }; // upsert: true จะทำการเพิ่มข้อมูลถ้าไม่พบข้อมูลที่ตรงกับเงื่อนไข

        const result = await customerShippop.updateOne(filter, update, options);
        if (result.upsertedCount > 0) {
            console.log('สร้างข้อมูลผู้รับคนใหม่');
        } else {
            console.log('อัปเดตข้อมูลผู้รับเรียบร้อย');
        }

        let data = [];
        data.push({
            "from": {
                "name": req.body.from.name,
                "address": req.body.from.address,
                "district": req.body.from.district,
                "state": req.body.from.state,
                "province": req.body.from.province,
                "postcode": req.body.from.postcode,
                "tel": req.body.from.tel
            },
            "origin": {
                "name": req.body.origin.name,
                "address": req.body.origin.address,
                "district": req.body.origin.district,
                "state": req.body.origin.state,
                "province": req.body.origin.province,
                "postcode": req.body.origin.postcode,
                "tel": req.body.origin.tel
            },
            "to": {
                "name": req.body.to.name,
                "address": req.body.to.address,
                "district": req.body.to.district,
                "state": req.body.to.state,
                "province": req.body.to.province,
                "postcode": req.body.to.postcode,
                "tel": req.body.to.tel
            },
            "parcel": {
                "name": req.body.parcel.name,
                "weight": weight,
                "width": req.body.parcel.width,
                "length": req.body.parcel.length,
                "height": req.body.parcel.height
            },
            //DHL FLE
            "showall": 1,
        });
        const value = {
            api_key: process.env.SHIPPOP_API_KEY,
            data: data,
        };
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/pricelist/`, value, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" },
        });
        if (!resp.data.status) {
            return res
                .status(400)
                .send({ status: false, message: resp.data.message });
        }
        const obj = resp.data.data[0];
        // return res.status(200).send({ status: true, message: obj });
        const new_data = [];

        const findinsured = await insuredExpress.findOne({ express: "SHIPPOP" })
        let insuranceFee = 0
        if (findinsured) {
            // console.log(findinsured.product_value)
            let product_value = findinsured.product_value
            for (let i = 0; i < product_value.length; i++) {
                if (declared_value >= product_value[i].valueStart && declared_value <= product_value[i].valueEnd) {
                    insuranceFee = product_value[i].insurance_fee
                    break;
                }
            }
        }
        // console.log(insuranceFee)

        //ค้นหาร้านค้า
        const findShop = await Shops.findOne({ _id: shop })
        if (!findShop) {
            return res
                .status(404)
                .send({ status: false, message: "ไม่สามารถค้นหาร้านเจอที่ท่านระบุได้" })
        }
        for (const ob of Object.keys(obj)) {
            if (obj[ob].available) {
                if (cod_amount > 0 && obj[ob].courier_code == 'ECP') {
                    console.log('Encountered "ECP". Skipping this iteration.');
                    continue; // ข้ามไปยังรอบถัดไป
                }
                // ทำการประมวลผลเฉพาะเมื่อ obj[ob].available เป็น true
                let v = null;
                let p = percent.find(element => element.courier_code == obj[ob].courier_code);
                // console.log(p)
                if (!p) {
                    console.log(`ยังไม่มี courier name: ${obj[ob].courier_code}`);
                }
                // คำนวนต้นทุนของร้านค้า
                let cost_tg = Number(obj[ob].price);
                let cost = Math.ceil(((cost_tg * p.profit_tg) / 100) + cost_tg);
                let price = Math.ceil(((cost * p.profit_shop) / 100) + cost);
                let profit = cost - cost_tg;
                let vat = (profit * 7) / 107;
                let total_platform = Number((profit - vat) * (p.platform / 100));

                v = {
                    ...obj[ob],
                    price_remote_area: 0,
                    cost_tg: cost_tg,
                    cost: cost,
                    profit: profit,
                    total_platform: total_platform,
                    cod_amount: Number(cod_amount.toFixed()),
                    fee_cod: 0,
                    price: Number(price.toFixed()),
                    declared_value: declared_value,
                    insuranceFee: insuranceFee,
                    total: 0,
                    status: null
                };

                let total = 0;

                if (obj[ob].hasOwnProperty("price_remote_area")) { //เช็คว่ามี ราคา พื้นที่ห่างไกลหรือเปล่า
                    total += obj[ob].price_remote_area + insuranceFee
                    v.price_remote_area = obj[ob].price_remote_area
                } else {
                    total += insuranceFee
                }

                if (cod_amount !== 0) {
                    let vat3per = Number(cod_amount) * (3 / 100);
                    let vat7per = Number(vat3per.toFixed(2)) * (7 / 100);
                    let vatCOD = Number(vat3per.toFixed(2)) + Number(vat7per.toFixed(2));
                    v.price_cod = Number(vat3per.toFixed(2));
                    v.price_cod_vat = Number(vat7per.toFixed(2));
                    total += Number(vatCOD.toFixed(2));
                }

                v.total = price + total;

                if (findShop.shop_wallet < v.total) {
                    v.status = "เงินในกระเป๋าของท่านไม่เพียงพอ"
                } else {
                    v.status = "พร้อมใช้งาน"
                }

                new_data.push(v);

                // console.log(new_data);
            } else {
                // ทำสิ่งที่คุณต้องการทำเมื่อ obj[ob].available เป็น false
                console.log(`Skipping ${obj[ob].courier_code} because available is false`);
            }
        }

        return res.status(200).send({ status: true, origin_data: req.body, new: new_data, sender: infoSender });
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
}

module.exports.booking = async (req, res) => {
    try {
        const invoice = await invoiceNumber();
        // console.log(invoice)
        const findTossagun_tel = await Members.findOne({ tel: req.body.platform })
        if (!findTossagun_tel) {
            return res.status(404).send({ status: false, message: "คุณยังไม่ได้เป็นสมาชิกทศกัณฐ์แฟมิลี่" })
        }

        let obj = [];
        let purchase_id = "";

        if (req.body.product_detail.length !== 0) {
            const value = {
                api_key: process.env.SHIPPOP_API_KEY,
                email: "tossagundigitalnewgeneration@gmail.com",
                url: {
                    "success": "http://shippop.com/?success",
                    "fail": "http://shippop.com/?fail"
                },
                data: req.body.product_detail,
                force_confirm: 1
            };
            const resp = await axios.post(`${process.env.SHIPPOP_URL}/booking/`, value, {
                headers: {
                    "Accept-Encoding": "gzip,deflate,compress",
                    "Content-Type": "application/json"
                },
            });
            if (!resp.data.status) {
                return res.status(400).send({ status: false, message: resp.data.data[0] });
            }

            obj = resp.data.data;
            purchase_id = resp.data.purchase_id;
        }

        const new_dataFull = [];
        const new_data = [];
        const new_dataBox = [];
        let cost_tg = 0;
        let cost = 0;
        let total = 0;
        let total_platform = 0;
        let cod = 0;
        let cod_charge = 0;
        let cod_vat = 0;
        let total_box = 0;

        if (req.body.box_detail.length !== 0) {
            for (let item of req.body.box_detail) {
                const b = {
                    ...item,
                };
                new_dataFull.push(b);
                new_dataBox.push(b);
                total += item.total;
                total_box += item.total;
            }
        }

        Object.keys(obj).forEach(async (ob) => {
            const percel = req.body.product_detail[ob];
            const v = {
                ...obj[ob],
                ...percel,
                invoice: invoice,
                purchase_id: String(purchase_id),
                shop_id: req.body.shop_id,
                employee_id: req.body.employee,
                type_payment: req.body.paymenttype,
                tossagun_tel: req.body.platform,
                timestamp: dayjs(Date.now()).format(),
            };
            new_data.push(v);
            new_dataFull.push(v);
            cost_tg += percel.cost_tg;
            cost += percel.cost;
            total += percel.total;
            total_platform += percel.total_platform;
            cod += percel.cod_amount;
            cod_charge += percel.price_cod;
            cod_vat += percel.price_cod_vat;
        });

        const o = {
            shop_id: req.body.shop_id,
            platform: req.body.platform,
            invoice: invoice,
            type: "Express",
            total: Number(total.toFixed(2)),
            total_cost: Number(cost.toFixed(2)),
            total_cost_tg: Number(cost_tg.toFixed(2)),
            total_platform: total_platform,
            total_cod: Number(cod.toFixed(2)),
            total_cod_charge: Number(cod_charge.toFixed(2)),
            total_cod_vat: Number(cod_vat.toFixed(2)),
            total_box: Number(total_box.toFixed(2)),
            payment_type: req.body.paymenttype,
            moneyreceive: req.body.moneyreceive,
            change: req.body.change,
            discount: req.body.discount,
            purchase_id: String(purchase_id),
            product: new_dataFull,
            employee: req.body.employee,
            status: [
                { name: "ชำระเงิน", timestamp: dayjs(Date.now()).format() }
            ],
            timestamp: dayjs(Date.now()).format(),
        };

        const createOrder = await OrderExpress.create(o);
        const createOrderShippop = await shippopBooking.insertMany(new_data);
        const createOrderBox = await OrderBoxExpress.insertMany(new_dataBox);
        if (!createOrderShippop && !createOrder && !createOrderBox) {
            console.log("ไม่สามารถสร้างข้อมูล booking ได้")
        }

        // ตัดเงิน
        const shop = await Shops.findOne({ _id: req.body.shop_id });

        const wallet1 = shop.shop_wallet - cost;
        const wallet2 = wallet1 + total_box;

        const findShop = await Shops.findByIdAndUpdate(req.body.shop_id, { shop_wallet: wallet2 }, { useFindAndModify: false });
        if (!findShop) {
            return res.status(404).send({ status: false, message: "ไม่สามารถค้นหาร้านที่ท่านระบุได้" })
        }

        const getteammember = await GetTeamMember(req.body.platform);
        if (!getteammember) {
            return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
        } else {

            // บันทึกการเงิน
            let profit = (total - cost) - total_box;
            let doto = {
                shop_id: shop._id,
                maker_id: req.body.maker_id,
                orderid: createOrder._id,
                name: `รายการขนส่งหมายเลขที่ ${invoice}`,
                type: `เงินออก`,
                category: 'Wallet',
                amount: total,
                before: shop.shop_wallet,
                after: shop.shop_wallet - total,
                timestamp: dayjs(Date.now()).format(""),
            }

            const record = await WalletHistory.create(doto)
            if (!record) {
                return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติเงินออกได้" })
            }

            let doto1 = {
                shop_id: shop._id,
                maker_id: req.body.maker_id,
                orderid: createOrder._id,
                name: `รายการขนส่งหมายเลขที่ ${invoice}`,
                type: `เงินเข้า`,
                category: 'Income',
                amount: profit,
                before: shop.shop_wallet - total,
                after: (shop.shop_wallet - total) + profit,
                timestamp: dayjs(Date.now()).format(""),
            }

            const record1 = await WalletHistory.create(doto1)
            if (!record1) {
                return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติเงินเข้าได้" })
            }

            if (req.body.box_detail.length !== 0) {

                let doto2 = {
                    shop_id: shop._id,
                    maker_id: req.body.maker_id,
                    orderid: createOrder._id,
                    name: `รายการขายกล่องพัสดุหมายเลขที่ ${invoice}`,
                    type: `เงินเข้า`,
                    category: 'Income',
                    amount: total_box,
                    before: (shop.shop_wallet - total) + profit,
                    after: ((shop.shop_wallet - total) + profit) + total_box,
                    timestamp: dayjs(Date.now()).format(""),
                }
                const record2 = await WalletHistory.create(doto2)
                if (!record2) {
                    return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติเงินเข้าได้" })
                }

            }

            // จ่ายค่าคอมมิชชั่น
            const commissionData = await commissions.Commission(createOrder, total_platform, getteammember, 'Express', (total - total_box));
            const commission = new Commission(commissionData);
            if (!commission) {
                return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
            } else {
                commission.save();
            }
            return res.status(200).send({ status: true, data: o, record: record, shop: findShop.shop_wallet, invoice: invoice })
        }
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err })
    }
}

module.exports.bookingBox = async (req, res) => {
    try {

    } catch (error) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
}

module.exports.cancelOrder = async (req, res) => {
    try {
        const { purchase_id, shop_id, maker_id } = req.body;
        if (!purchase_id || !shop_id) {
            return res.status(400).send({ status: false, message: "ไม่พบข้อมูล" });
        }

        //ค้นหา order express
        const order_express = await OrderExpress.findOne({
            purchase_id: purchase_id,
            shop_id: shop_id,
        });

        if (!order_express) {
            return res.status(400).send({ message: "ไม่มีใบสั่งซื้อที่ต้องการยกเลิก" });
        }
        console.log("Order Express : ", order_express);

        const shop = await Shops.findById(order_express.shop_id);

        const booking = await shippopBooking.find({
            shop_id: shop_id,
            purchase_id: purchase_id,
            order_status: "booking",
        });

        if (booking.length === 0) {
            return res.status(400).send({
                status: true,
                message:
                    "ไม่สามารถยกเลิกได้ เนื่องจากพัสดุถูกยกเลิกหรือขนส่งรับพัสดุไปแล้ว",
            });
        }

        //ตรวจสอบสถานะของพัสดุว่าสามารถยกเลิกได้ไหม
        // const cost = booking.reduce((sum, booking) => sum + booking.cost, 0);
        let cost = 0;

        console.log("ยกเลิกพัสดุ ต้นทุน : ", cost);
        if (booking.length > 0) {
            for (let i = 0; i < booking.length; i++) {
                const value = {
                    api_key: process.env.SHIPPOP_API_KEY,
                    tracking_code: booking[i].tracking_code
                };

                const resp = await axios.post(`${process.env.SHIPPOP_URL}/cancel/`, value, {
                    headers: {
                        "Accept-Encoding": "gzip,deflate,compress",
                        "Content-Type": "application/json"
                    },
                });

                if (resp.data.status) {
                    console.log(
                        "/---ยกเลิกเลขพัสดุ " + booking[i].tracking_code + " เรียบร้อย"
                    );
                    const parcel = await shippopBooking.findOne({
                        tracking_code: booking[i].tracking_code,
                    });
                    if (parcel) {
                        console.log(
                            "---ถูกยกเลิกพัสดุ tracking_code : " + booking[i].tracking_code
                        );
                        await shippopBooking.findByIdAndUpdate(parcel._id, {
                            order_status: "cancel",
                        }).then(() => {
                            cost += (booking[i].total / 2);
                        });
                    }
                } else {
                    return res.status(400).send({ status: false, message: resp.data.data[0] });
                }

            } // end loop for

            console.log("ต้นทุนคืนกระเป๋าพาร์ทเนอร์ร้านค้า : ", cost);
            // อัพเดต สถานะ order express
            console.log("อัพเดตสถานะ Order Express");
            const new_status = {
                name: "ยกเลิก",
                timestamp: dayjs(Date.now()).format(),
            };
            order_express.status.push(new_status);
            console.log("New Status", new_status);

            await OrderExpress.findByIdAndUpdate(order_express._id, {
                status: order_express.status,
            });

            // คืนเงินเข้ากระเป๋า
            console.log("คืนเงินเข้ากระเป๋า");
            const new_money = shop.shop_wallet + cost;
            await Shops.findByIdAndUpdate(shop._id, {
                shop_wallet: new_money
            });

            console.log("บันทึกประวัติเงินเข้า-ออก");
            const money_history = {
                shop_id: order_express.shop_id,
                maker_id: maker_id,
                orderid: order_express.invoice,
                name: `ยกเลิกพัสดุหมายเลขที่ ${order_express.invoice}`,
                type: "เงินเข้า",
                category: 'Wallet',
                amount: cost,
                before: shop.shop_wallet,
                after: new_money,
                timestamp: dayjs(Date.now()).format(),
            };
            await WalletHistory.create(money_history);
            console.log("---เสร็จสิ้น---");
            return res.status(200).send({ status: true, message: "ยกเลิกพัสดุเรียบร้อย" });
        } else {
            return res.status(400).send({ status: false, messgae: "ดึงข้อมูลไม่สำเร็จ" });
        }
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
}

module.exports.tracking = async (req, res) => {
    try {
        const tracking = req.params.id
        const valueCheck = {
            api_key: process.env.SHIPPOP_API_KEY,
            tracking_code: tracking,
        };
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/tracking/`, valueCheck, {
            headers: {
                "Accept-Encoding": "gzip,deflate,compress",
                "Content-Type": "application/json"
            },
        })
        if (!resp) {
            return res
                .status(400)
                .send({ status: false, message: "ไม่สามารถหาหมายเลข Tracking ได้" })
        }
        return res
            .status(200)
            .send({ status: true, data: resp.data })
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
};

module.exports.labelHtml = async (req, res) => { //ใบแปะหน้าโดย purchase(html)
    try {
        const { shop_id, purchase_id } = req.body;
        if (shop_id === undefined || purchase_id === undefined) {
            return res.status(400).send({ status: false, message: "รับข้อมูลไม่ครบถ้วน" });
        }
        const booking = await shippopBooking.find({
            shop_id: shop_id,
            purchase_id: purchase_id,
        });
        const tracking_code = [];
        let option = {};
        for (let i = 0; i < booking.length; i++) {
            if (booking[i].status !== "cancel") {
                tracking_code.push(booking[i].tracking_code);
            }
            option[booking[i].tracking_code] = {
                replaceOrigin: { ...booking[i].origin },
            };
        }
        const value = {
            api_key: process.env.SHIPPOP_API_KEY,
            purchase_id: purchase_id,
            tracking_code: String(tracking_code),
            size: "sticker4x6",
            // logo: "https://nbadigitalworlds.com/img/nba-express2.png",
            type: "html",
            options: option,
        };
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/v2/label/`, value, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" },
        });
        return res.status(200).send(resp.data);
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
};

module.exports.dropoff = async (req, res) => {
    try {
        const value = {
            api_key: process.env.SHIPPOP_API_KEY,
            email: "tossagundigitalnewgeneration@gmail.com",
            data: req.body,
        };

        const resp = await axios.post(`${process.env.SHIPPOP_URL}/booking/`, value, {
            headers: {
                "Accept-Encoding": "gzip,deflate,compress",
                "Content-Type": "application/json"
            },
        });

        console.log(resp.data)

    } catch (error) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
};

async function invoiceNumber() {
    // data = `TSP`
    // let random = Math.floor(Math.random() * 100000000000)
    // const combinedData = data + random;
    // const findInvoice = await shippopBooking.find({ invoice: combinedData })

    // while (findInvoice && findInvoice.length > 0) {
    // สุ่ม random ใหม่
    // random = Math.floor(Math.random() * 100000000000);
    // combinedData = data + random;

    // เช็คใหม่
    // findInvoice = await shippopBooking.find({ invoice: combinedData });
    // }

    // console.log(combinedData);
    // return combinedData;
    const pipelint = [
        // {
        // $match: { shop_type: shop_type },
        // },
        {
            $group: { _id: 0, count: { $sum: 1 } },
        },
    ];
    const count = await OrderExpress.aggregate(pipelint);
    const countValue = count.length > 0 ? count[0].count + 1 : 1;
    const data = `TSP${dayjs(Date.now()).format("YYMMDD")}${countValue.toString().padStart(3, "0")}`;
    return data;
}

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

async function confirmOrder(purchase_id, shop_id, res) {
    try {
        if (purchase_id === undefined || shop_id === undefined) {
            // return res.status(500).send({ status: false, message: "รับข้อมูลไม่ครบถ้วน" });
            console.log("รับข้อมูลไม่ครบถ้วน")
        }

        const booking = await shippopBooking.find({
            shop_id: shop_id,
            purchase_id: purchase_id,
        });

        const value = {
            api_key: process.env.SHIPPOP_API_KEY,
            purchase_id: purchase_id,
        };

        const resp = await axios.post(`${process.env.SHIPPOP_URL}/confirm/`, value, {
            headers: {
                "Accept-Encoding": "gzip,deflate,compress",
                "Content-Type": "application/json"
            },
        });

        // console.log(resp)

        if (!resp.data.status) {
            console.log(resp.data.message)
            // return res.status(400).send({ status: false, message: resp.data.message });
        }

        for (let i = 0; i < booking.length; i++) {
            await shippopBooking.findByIdAndUpdate(booking[i]._id, {
                order_status: "booking",
            });
        }
        console.log("ยืนยันใบสั่งซื้อ : " + purchase_id);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, error: error.message });
    }
};


module.exports.order = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).send({ statue: false, message: error.details[0].message })
        }
        const invoice = await invoiceNumber(req.body.shop_id, req.body.status[0].timestamp);
        const date = dayjs(Date.now()).format('')
        const data = {
            ...req.body, invoice: invoice, timestamp: date
        };
        const order = await OrderExpress.create(data);
        if (order) {
            return res.status(201).send({ status: true, message: "สร้างรายการสำเร็จ", result: order });
        } else {
            return res.status(400).send({ status: false, message: "สร้างรายการไม่สำเร็จ" });
        }
    } catch (err) {
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
}

// module.exports = { priceList, booking, cancelOrder, tracking, labelHtml }

