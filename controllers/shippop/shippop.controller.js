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

priceList = async (req, res) => {
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
        const sender = formData.from;
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
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/pricelist/`, value,
            {
                headers: { "Accept-Encoding": "gzip,deflate,compress" },
            }
        )
        if (!resp.data.status) {
            return res
                .status(400)
                .send({ status: false, message: resp.data.message });
        }
        const obj = resp.data.data[0];
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
        const findShop = await Shops.findOne({ shop_number: shop })
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
                let cost_hub = Number(obj[ob].price);
                let cost = Math.ceil(((cost_hub * p.profit_tg) / 100) + cost_hub)
                let price = Math.ceil(((cost * p.profit_shop) / 100) + cost)

                v = {
                    ...obj[ob],
                    price_remote_area: 0,
                    cost_tg: cost_hub,
                    cost: cost,
                    cod_amount: Number(cod_amount.toFixed()),
                    fee_cod: 0,
                    price: Number(price.toFixed()),
                    declared_value: declared_value,
                    insuranceFee: insuranceFee,
                    total: 0,
                    status: null
                };

                if (obj[ob].hasOwnProperty("price_remote_area")) { //เช็คว่ามี ราคา พื้นที่ห่างไกลหรือเปล่า
                    let total = price + obj[ob].price_remote_area + insuranceFee
                    v.price_remote_area = obj[ob].price_remote_area
                    v.total = total
                } else {
                    let total = price + insuranceFee
                    v.total = total
                }

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

        return res
            .status(200)
            .send({
                status: true,
                origin_data: req.body,
                new: new_data,
                sender: infoSender
            });
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
}

booking = async (req, res) => {
    try {
        const formData = req.body
        const price = req.body.price
        const weight = req.body.parcel.weight
        const id = req.decoded.userid
        const price_remote_area = req.body.price_remote_area
        const declared_value = req.body.declared_value
        const insuranceFee = req.body.insuranceFee
        const shop_number = req.body.shop_number
        const maker_id = req.body.maker_id
        const tossagun_tel = req.body.tossagun_tel
        const cost_tg = req.body.cost_tg
        const type_payment = req.body.type_payment
        const cost = req.body.cost
        const total = req.body.total
        formData.parcel.weight = weight
        const data = [{ ...formData }] //, courier_code:courierCode
        const total_platfrom = req.body.cost - req.body.cost_tg

        const invoice = await invoiceNumber()
        // console.log(invoice)
        const findTossagun_tel = await Members.findOne({ tel: tossagun_tel })
        if (!findTossagun_tel) {
            return res.status(404).send({ status: false, message: "คุณยังไม่ได้เป็นสมาชิกทศกัณฐ์แฟมิลี่" })
        }
        const value = {
            api_key: process.env.SHIPPOP_API_KEY,
            email: "nbadigitalservice@gmail.com",
            url: {
                "success": "http://shippop.com/?success",
                "fail": "http://shippop.com/?fail"
            },
            data: data,
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

        //ตัดเงิน
        const findShop = await Shops.findOneAndUpdate({
            shop_number: shop_number
        }, {
            $inc: {
                shop_wallet: -total
            }
        }, { new: true })
        if (!findShop) {
            return res.status(404).send({ status: false, message: "ไม่สามารถค้นหาร้านที่ท่านระบุได้" })
        }

        const Data = resp.data.data[0]
        const parcel = data[0].parcel
        const new_data = []
        const v = {
            ...Data, //มี declared_value และ cod_amount อยู่แล้วใน ...Data ไม่ต้องสร้างเพิ่ม
            parcel: parcel,
            invoice: invoice,
            purchase_id: String(resp.data.purchase_id),
            cost_tg: cost_tg,
            cost: cost,
            declared_value: declared_value,
            insuranceFee: insuranceFee,
            // price_remote_area: price_remote_area,
            // type_payment: type_payment,
            // tossagun_tel: tossagun_tel,
            price: Number(price.toFixed()),
            total: Number(total.toFixed()),
            shop_id: findShop._id,
        };
        const o = {
            shop_id: findShop._id,
            platform: tossagun_tel,
            invoice: invoice,
            total: Number(total.toFixed()),
            total_cost: cost,
            total_cost_tg: cost_tg,
            payment_type: type_payment,
            purchase_id: String(resp.data.purchase_id),
            product: data,
            employee: req.body.employee,
            status: [
                { name: "รอชำระเงิน", timestamp: dayjs(Date.now()).format() }
            ],
            timestamp: dayjs(Date.now()).format(),
        }
        new_data.push(v);
        const createOrder = new OrderExpress(o);
        const createOrderShippop = new shippopBooking(v)
        if (!createOrderShippop && !createOrder) {
            console.log("ไม่สามารถสร้างข้อมูล booking ได้")
        }

        const getteammember = await GetTeamMember(tossagun_tel);
        if (!getteammember) {
            return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
        } else {
            createOrder.save();
            createOrderShippop.save();

            //บันทึกการเงิน
            let before = findShop.shop_wallet + total
            let doto = {
                shop_id: findShop._id,
                maker_id: maker_id,
                orderid: createOrder._id,
                name: `รายการขนส่งหมายเลขที่ ${invoice}`,
                type: `เงินออก`,
                categort: 'Wallet',
                amount: total,
                before: before,
                after: findShop.shop_wallet,
                timestamp: dayjs(Date.now()).format(""),
            }
            const record = await WalletHistory.create(doto)
            if (!record) {
                return res.status(400).send({ status: false, message: "ไม่สามารถสร้างประวัติการเงินได้" })
            }

            // จ่ายค่าคอมมิชชั่น
            const commissionData = await commissions.Commission(createOrder, total_platfrom, getteammember, 'Express');
            const commission = new Commission(commissionData);
            if (!commission) {
                return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
            } else {
                commission.save();
            }
            return res.status(200).send({ status: true, data: new_data, record: record, shop: findShop.shop_wallet })
        }
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err })
    }
}

cancelOrder = async (req, res) => {
    try {
        const tracking_code = req.params.tracking_code
        const valueCheck = {
            api_key: process.env.SHIPPOP_API_KEY,
            tracking_code: tracking_code,
        };
        const findStatus = await shippopBooking.findOne({ tracking_code: tracking_code });
        if (!findStatus) {
            return res
                .status(400)
                .send({ status: false, message: "ไม่มีหมายเลขที่ท่านกรอก" });
        } else if (findStatus.order_status == 'cancel') {
            return res
                .status(404)
                .send({ status: false, message: "หมายเลขสินค้านี้ถูก cancel ไปแล้ว" })
        }

        const respStatus = await axios.post(`${process.env.SHIPPOP_URL}/cancel/`, valueCheck,
            {
                headers: {
                    "Accept-Encoding": "gzip,deflate,compress",
                    "Content-Type": "application/json"
                },
            }
        )
        if (respStatus.data.status != true) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "ไม่สามารถทำการยกเลิกสินค้าได้",
                    data: respStatus.data
                })
        } else {
            const findPno = await shippopBooking.findOneAndUpdate(
                { tracking_code: tracking_code },
                { $set: { order_status: 'cancel' } },
                { new: true }
            );
            if (!findPno) {
                return res
                    .status(400)
                    .send({ status: false, message: "ไม่สามารถค้นหาหมายเลข tracking_code หรืออัพเดทข้อมูลได้" })
            }
            return res
                .status(200)
                .send({ status: false, data: findPno })
        }

    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
}

tracking = async (req, res) => {
    try {
        const tracking = req.params.id
        const valueCheck = {
            api_key: process.env.SHIPPOP_API_KEY,
            tracking_code: tracking,
        };
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/tracking/`, valueCheck,
            {
                headers: {
                    "Accept-Encoding": "gzip,deflate,compress",
                    "Content-Type": "application/json"
                },
            }
        )
        if (!resp) {
            return res
                .status(400)
                .send({ status: false, message: "ไม่สามารถหาหมายเลข Tracking ได้" })
        }
        // console.log(resp.data.order_status)
        return res
            .status(200)
            .send({ status: true, data: resp.data })
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }
}

labelHtml = async (req, res) => { //ใบแปะหน้าโดย purchase(html)
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
                replaceOrigin: { ...booking[i].from },
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
}

async function invoiceNumber() {
    data = `TSP`
    let random = Math.floor(Math.random() * 100000000000)
    const combinedData = data + random;
    const findInvoice = await shippopBooking.find({ invoice: combinedData })

    while (findInvoice && findInvoice.length > 0) {
        // สุ่ม random ใหม่
        random = Math.floor(Math.random() * 100000000000);
        combinedData = data + random;

        // เช็คใหม่
        findInvoice = await shippopBooking.find({ invoice: combinedData });
    }

    console.log(combinedData);
    return combinedData;
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


order = async (req, res) => {
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

module.exports = { priceList, booking, cancelOrder, tracking, labelHtml }

