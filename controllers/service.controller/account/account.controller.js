const { ProductAccounts, validate } = require("../../../model/service/account/account.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { OrderServiceModels } = require("../../../model/service/order/order.model");
const { Members } = require("../../../model/user/member.model");
const dayjs = require("dayjs");
const office = require("../../../function/office")
const commissions = require("../../../function/commission");
const line = require("../../../lib/line.notify");
const { Shops } = require("../../../model/pos/shop.model");
const { Commission } = require("../../../model/pos/commission/commission.model");
const { WalletHistory } = require("../../../model/wallet/wallet.history.model");

const uploadFolder = path.join(__dirname, '../../../assets/account');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: (req, file, cb) => {
        cb(null, 'act' + file.originalname, + "-" + Date.now());
    },
});

// Create product
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            const { error } = validate(req.body);
            if (error) {
                fs.unlinkSync(req.file.path);
                return res
                    .status(400)
                    .send({ message: error.details[0].message, status: false });
            } else {
                const product = await ProductAccounts.findOne({
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
                        await new ProductAccounts({
                            ...req.body,
                        }).save();
                        return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                    } else {
                        await new ProductAccounts({
                            ...req.body,
                            image: req.file.filename
                        }).save();
                        return res.status(201).send({ message: "เพิ่มข้อมูลสินค้าทำเร็จ", status: true });
                    }
                }
            }
        });
    } catch (error) {
        // console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Get All product
module.exports.getProductAll = async (req, res) => {
    try {
        const product = await ProductAccounts.find();
        if (!product)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get product by id
module.exports.getProductById = async (req, res) => {
    try {
        const product = await ProductAccounts.findById(req.params.id);
        if (!product)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get product by categiry id
module.exports.getProductByCategoryId = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await ProductAccounts.find();
        const products = product.filter(
            (el) => el.category === id,
        );
        if (!products)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: products });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Delete product
module.exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        ProductAccounts.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
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

// Update product
module.exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            if (!req.file) {
                ProductAccounts.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
                    if (!data) {
                        fs.unlinkSync(req.file.path);
                        return res.status(404).send({
                            message: `ไม่สามารถเเก้ไขสินค้านี้ได้!`,
                            status: false,
                        });
                    } else
                        res.send({
                            message: "แก้ไขสินค้าสำเร็จ",
                            status: true,
                        });
                }).catch((err) => {
                    fs.unlinkSync(req.file.path);
                    return res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด",
                        status: false,
                    });
                });
            } else {
                ProductAccounts.findByIdAndUpdate(id, { ...req.body, image: req.file.filename }, { useFindAndModify: false }).then((data) => {
                    if (!data) {
                        fs.unlinkSync(req.file.path);
                        return res.status(404).send({
                            status: false,
                            message: `ไม่สามารถเเก้ไขสินค้านี้ได้!`,
                        });
                    } else
                        return res.status(201).send({
                            message: "แก้ไขสินค้าสำเร็จ",
                            status: true,
                        });
                }).catch((err) => {
                    fs.unlinkSync(req.file.path);
                    return res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด",
                        status: false,
                    });
                });
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
        const imagePath = path.join(__dirname, '../../../assets/account', imgname);
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
                const account = await ProductAccounts.findOne({
                    _id: item.packageid
                });
                product_price += account.net;
            }
            if (shop.shop_wallet < product_price) {
                return res.status(403).send({ status: false, message: "ยอดเงินในระบบไม่เพียงพอ", });
            } else {
                const order = [];
                const order_office = [];
                let packagedetail;
                let total_price = 0;
                let total_cost = 0;
                let total_platfrom = 0;

                for (let item of req.body.product_detail) {
                    const product = await ProductAccounts.findOne({ _id: item.packageid });
                    if (product) {
                        packagedetail = `${product.detail}, ${item.packagedetail}`
                        total_price = product.price * item.quantity;
                        total_cost = product.cost * item.quantity;
                        total_platfrom = product.service.platform * item.quantity;

                        order.push({
                            packageid: product._id,
                            packagename: product.name,
                            packagedetail: packagedetail,
                            quantity: item.quantity,
                            price: total_price,
                            cost: total_cost,
                            platform: total_platfrom,
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
                const totalplatform = order.reduce((accumulator, currentValue) => accumulator + currentValue.platform, 0);

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
                    servicename: "Account",
                    cost: totalcost,
                    price: totalprice,
                    freight: 0,
                    net: totalprice,
                    totalplatform: totalplatform,
                    moneyreceive: req.body.moneyreceive,
                    employee: req.body.employee,
                    change: req.body.change,
                    status: {
                        name: "รอดำเนินการ",
                        timestamp: dayjs(Date.now()).format(""),
                    },
                    timestamp: dayjs(Date.now()).format(""),
                };
                const new_order = new OrderServiceModels(data);
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
                    await office.OrderOfficeCreate(formOrderOffice);

                    // ตัดเงิน
                    const newwallet = shop.shop_wallet - (totalprice);
                    await Shops.findByIdAndUpdate(shop._id, { shop_wallet: newwallet }, { useFindAndModify: false });

                    // จ่ายค่าคอมมิชชั่น
                    const commissionData = await commissions.Commission(new_order, totalplatform, getteammember, 'Account');
                    const commission = new Commission(commissionData);

                    if (!commission) {
                        return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
                    } else {
                        commission.save();
                        const wallethistory = {
                            maker_id: req.body.maker_id,
                            shop_id: shop._id,
                            orderid: new_order._id,
                            name: `รายการบริการ Account ใบเสร็จเลขที่ ${new_order.invoice}`,
                            type: "เงินออก",
                            category: 'Wallet',
                            before: shop.shop_wallet,
                            after: newwallet,
                            amount: new_order.net,
                        };
                        const walletHistory = new WalletHistory(wallethistory);
                        if (!walletHistory) {
                            return res.status(403).send({ status: false, message: 'ไม่สามารถบันทึกประวัติการเงินได้' });
                        } else {
                            walletHistory.save();
                            const message = `
แจ้งงานเข้า : ${new_order.servicename}
เลขที่ทำรายการ : ${new_order.invoice}
ตรวจสอบได้ที่ : https://office.ddscservices.com/
               
*ฝากรบกวนตรวจสอบด้วยนะคะ/ครับ*`;
                            await line.linenotify(message);
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
}

async function GenerateRiceiptNumber(shop_type, id, number) {
    if (shop_type === 'One Stop Service') {
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
            .padStart(5, "0")}`;
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