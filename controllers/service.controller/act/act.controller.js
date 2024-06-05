const { ProductActs, validate } = require("../../../model/service/act/act.model");
const multer = require('multer')
const fs = require('fs')
const path = require("path");
const { Shops } = require("../../../model/pos/shop.model");
const { OrderServiceModels } = require("../../../model/service/order/order.model");
const { OrderActRefModels } = require("../../../model/service/order/order.ref.model");
const { Commission } = require("../../../model/pos/commission/commission.model");
const { WalletHistory } = require("../../../model/wallet/wallet.history.model");
const { Members } = require("../../../model/user/member.model");
const dayjs = require("dayjs");
const office = require("../../../function/office")
const commissions = require("../../../function/commission");
const line = require("../../../lib/line.notify");

const uploadFolder = path.join(__dirname, '../../../assets/act');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: (req, file, cb) => {
        cb(null, 'act' + '-' + Date.now());
    },
});

const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: (req, file, cb) => {
        cb(null, 'order' + Date.now());
    },
});

// Create ACT
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            if (!req.file) {
                const { error } = validate(req.body);
                if (error) {
                    fs.unlinkSync(req.file.path);
                    return res
                        .status(400)
                        .send({ message: error.details[0].message, status: false });
                } else {
                    const product = await ProductActs.findOne({
                        name: req.body.name,
                    });
                    if (product) {
                        fs.unlinkSync(req.file.path);
                        return res.status(409).send({
                            status: false,
                            message: "มีสินค้านี้ในระบบแล้ว",
                        });
                    } else {
                        if (!req.file) {
                            await new ProductActs({
                                ...req.body,
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        } else {
                            await new ProductActs({
                                ...req.body,
                                image: req.file.filename
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        }
                    }
                }
            } else {
                const { error } = validate(req.body);
                if (error) {
                    fs.unlinkSync(req.file.path);
                    return res
                        .status(400)
                        .send({ message: error.details[0].message, status: false });
                } else {
                    const product = await ProductActs.findOne({
                        name: req.body.name,
                    });
                    if (product) {
                        fs.unlinkSync(req.file.path);
                        return res.status(409).send({
                            status: false,
                            message: "มีสินค้านี้ในระบบแล้ว",
                        });
                    } else {
                        if (!req.file) {
                            await new ProductActs({
                                ...req.body,
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        } else {
                            await new ProductActs({
                                ...req.body,
                                image: req.file.filename
                            }).save();
                            return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Get All ACT
module.exports.getAll = async (req, res) => {
    try {
        const act = await ProductActs.find();
        if (!act)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: act });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get ACT by id
module.exports.getById = async (req, res) => {
    try {
        const act = await ProductActs.findById(req.params.id);
        if (!act)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: act });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

module.exports.getByCateId = async (req, res) => {
    try {
        const pipeline = [
            {
                $match: { "category": req.params.cateid },
            }
        ];
        const act = await ProductActs.aggregate(pipeline);
        if (act) {
            return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: act });
        } else {
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Delete ACT
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        ProductActs.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
            if (!data) {
                return res.status(404).send({ message: `ไม่สามารถลบรายงานนี้ได้`, status: false, });
            } else {
                return res.send({ message: "ลบรายงานนี้เรียบร้อยเเล้ว", status: true, });
            }
        }).catch((err) => {
            return res.status(500).send({ message: "ไม่สามารถลบรายงานนี้ได้", status: false, });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Update ACT
module.exports.update = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file);
            if (!req.file) {
                const id = req.params.id;
                ProductActs.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
                    if (!data) {
                        res.status(404).send({
                            message: `ไม่สามารถเเก้ไขรายงานนี้ได้`,
                            status: false,
                        });
                    } else
                        res.send({
                            message: "แก้ไขรายงานนี้เรียบร้อยเเล้ว",
                            status: true,
                        });
                }).catch((err) => {
                    res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด",
                        status: false,
                    });
                });
            } else if (err instanceof multer.MulterError) {
                return res.send(err);
            } else if (err) {
                return res.send(err);
            } else {
                uploadFile(req, res);
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getImage = async (req, res) => {
    try {
        const imgname = req.params.imgname;
        const imagePath = path.join(__dirname, '../../../assets/act', imgname);
        // return res.send(`<img src=${imagePath}>`);
        return res.sendFile(imagePath);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.createOrder = async (req, res) => {
    try {
        if (req.body.shop_type === 'One Stop Service') {
            await checkEmployee(req, res);
        } else {
            console.log('ยังไม่สามารถดำเนินการได้')
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
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
            let product_price = 0;
            for (let item of req.body.product_detail) {
                const act = await ProductActs.findOne({
                    _id: item.packageid
                });
                product_price += act.net;
            }
            if (shop.shop_wallet < product_price) {
                return res.status(403).send({ status: false, message: "ยอดเงินในระบบไม่เพียงพอ", });
            } else {
                const order = [];
                const order_office = [];
                let packagedetail;
                let total_price = 0;
                let total_cost = 0;
                let total_freight = 0;
                let total_platfrom = 0;
                let profit = 0;
                let profit_shop = 0;
                for (let item of req.body.product_detail) {
                    const product = await ProductActs.findOne({ _id: item.packageid });
                    if (product) {
                        packagedetail = `${product.detail}, ${item.packagedetail}`
                        total_price = product.price * item.quantity;
                        total_cost = product.cost * item.quantity;
                        total_freight = product.freight * item.quantity;
                        total_platfrom = product.service.platform * item.quantity;
                        profit = product.service.profit_TG * item.quantity;
                        profit_shop = product.service.profit_shop * item.quantity;
                        order.push({
                            packageid: product._id,
                            packagename: product.name,
                            packagedetail: packagedetail,
                            quantity: item.quantity,
                            price: total_price,
                            cost: total_cost,
                            freight: total_freight,
                            platform: total_platfrom,
                            profit: profit,
                            profit_shop: profit_shop,
                        });
                        order_office.push({
                            packagename: product.name,
                            packagedetail: packagedetail,
                            quantity: item.quantity,
                        })
                    } else {
                        return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลสินค้า' });
                    }
                }

                const totalprice = order.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0);
                const totalcost = order.reduce((accumulator, currentValue) => accumulator + currentValue.cost, 0);
                const totalfreight = order.reduce((accumulator, currentValue) => accumulator + currentValue.freight, 0);
                const totalplatform = order.reduce((accumulator, currentValue) => accumulator + currentValue.platform, 0);
                const totalprofit = order.reduce((accumulator, currentValue) => accumulator + currentValue.profit, 0);
                const totalprofitshop = order.reduce((accumulator, currentValue) => accumulator + currentValue.profit_shop, 0);

                const invoice = await GenerateRiceiptNumber(req.body.shop_type, req.body.shop_id, shop.shop_number);

                const data = {
                    invoice: invoice,
                    maker_id: req.body.maker_id,
                    shop_id: shop._id,
                    platform: req.body.platform,
                    customer_name: req.body.customer_name,
                    customer_tel: req.body.customer_tel,
                    customer_address: req.body.customer_address,
                    customer_iden: req.body.customer_iden,
                    customer_line: req.body.customer_line,
                    product_detail: order,
                    shop_type: req.body.shop_type,
                    paymenttype: req.body.paymenttype,
                    servicename: "Act",
                    profit: totalprofit,
                    profit_shop: totalprofitshop,
                    cost: totalcost,
                    price: totalprice,
                    freight: totalfreight,
                    net: totalprice + totalfreight,
                    totalplatform: totalplatform,
                    moneyreceive: req.body.moneyreceive,
                    employee: req.body.employee,
                    change: req.body.change,
                    status: {
                        name: "รอดำเนินการแนบรูป",
                        timestamp: dayjs(Date.now()).format(""),
                    },
                    timestamp: dayjs(Date.now()).format(""),
                };

                const data_ref = {
                    invoice: invoice,
                    employee: req.body.employee,
                    status: {
                        name: "รอดำเนินการแนบรูป",
                        timestamp: dayjs(Date.now()).format(""),
                    },
                    timestamp: dayjs(Date.now()).format(""),
                };

                const new_order = new OrderServiceModels(data);
                const new_order_ref = new OrderActRefModels(data_ref);
                const formOrderOffice = {
                    receiptnumber: invoice,
                    detail: "Accoutting",
                    customer: {
                        customer_iden: req.body.customer_iden,
                        customer_name: req.body.customer_name,
                        customer_tel: req.body.customer_tel,
                        customer_address: req.body.customer_address,
                        customer_line: req.body.customer_line,
                    },
                    product_detail: order_office,
                };

                const getteammember = await GetTeamMember(req.body.platform);
                if (!getteammember) {
                    return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
                } else {
                    new_order.save();
                    console.log('สร้างรายการออเดอร์สำเร็จ')
                    new_order_ref.save();
                    await office.OrderOfficeCreate(formOrderOffice);

                    // ตัดเงิน
                    const newwallet = shop.shop_wallet - ((totalprice - totalprofit) + totalfreight);
                    await Shops.findByIdAndUpdate(shop._id, { shop_wallet: newwallet },
                        { useFindAndModify: false });

                    // จ่ายค่าคอมมิชชั่น
                    const commissionData = await commissions.Commission(new_order, totalplatform, getteammember, 'Act', (totalprice + totalfreight));
                    const commission = new Commission(commissionData);

                    if (!commission) {
                        return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
                    } else {
                        commission.save();
                        const wallethistory = {
                            maker_id: req.body.maker_id,
                            shop_id: shop._id,
                            orderid: new_order._id,
                            name: `รายการบริการ พ.ร.บ. ใบเสร็จเลขที่ ${new_order.invoice}`,
                            type: "เงินออก",
                            category: 'Wallet',
                            before: shop.shop_wallet,
                            after: shop.shop_wallet - new_order.net,
                            amount: new_order.net,
                        };
                        const wallethistoryone = {
                            maker_id: req.body.maker_id,
                            shop_id: shop._id,
                            orderid: new_order._id,
                            name: `รายการบริการ พ.ร.บ. ใบเสร็จเลขที่ ${new_order.invoice}`,
                            type: "เงินเข้า",
                            category: 'Income',
                            before: shop.shop_wallet - new_order.net,
                            after: (shop.shop_wallet - new_order.net) + totalprofitshop,
                            amount: totalprofitshop,
                        };
                        const walletHistory = new WalletHistory(wallethistory);
                        const walletHistoryone = new WalletHistory(wallethistoryone);
                        if (!walletHistory && !walletHistoryone) {
                            return res.status(403).send({ status: false, message: 'ไม่สามารถบันทึกประวัติการเงินได้' });
                        } else {
                            walletHistory.save();
                            console.log('- - บันทึกประวัติเงินออกสำเร็จ - -')
                            walletHistoryone.save();
                            console.log('- - บันทึกประวัติเงินเข้าสำเร็จ - -')
                            const message = `
แจ้งงานเข้า : ${new_order.servicename} (บริการ พ.ร.บ.)
เลขที่ทำรายการ : ${new_order.invoice}
ตรวจสอบได้ที่ : https://office.ddscservices.com/
               
*ฝากรบกวนตรวจสอบด้วยนะคะ/ครับ*`;
                            // await line.linenotify(message);
                            return res.status(200).send({ status: true, data: data, ยอดเงินคงเหลือ: newwallet });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

async function GenerateRiceiptNumber(shop_type, id, number) {
    if (shop_type === 'One Stop Shop') {
        const pipelint = [
            {
                $match: {
                    $and: [
                        { shop_type: shop_type },
                        { shop_id: id },
                    ],
                },
            },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const count = await OrderServiceModels.aggregate(pipelint);
        const countValue = count.length > 0 ? count[0].count + 1 : 1;
        const data = `TG${dayjs(Date.now()).format("YYMM")}${number}${countValue
            .toString()
            .padStart(3, "0")}`;
        return data;
    } else {
        const pipelint = [
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const count = await OrderServiceModels.aggregate(pipelint);
        const countValue = count.length > 0 ? count[0].count + 1 : 1;
        const data = `TG${dayjs(Date.now()).format("YYMM")}${countValue.toString().padStart(4, "0")}`;
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