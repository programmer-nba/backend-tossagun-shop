const { Commission } = require("../../../model/pos/commission/commission.model");
const { Percents } = require("../../../model/pos/commission/percent.model");
const { ProductArtworks } = require("../../../model/service/artwork/artwork.model");
const { PriceArtworks } = require("../../../model/service/artwork/price.model");
const { OrderServiceModels, validate } = require("../../../model/service/order/order.model");
const { OrderActRefModels } = require("../../../model/service/order/order.ref.model");
const { OrderFlightTicket } = require("../../../model/AOC/api.service.models/aoc.tricket.model")
const { Members } = require("../../../model/user/member.model");
const { WalletHistory } = require("../../../model/wallet/wallet.history.model");
const { shippopBooking } = require("../../../model/shippop/shippop.order");
const { OrderExpress } = require("../../../model/shippop/order.express.model");
const { Shops } = require("../../../model/pos/shop.model");
const dayjs = require("dayjs");
const office = require("../../../function/office")
const commissions = require("../../../function/commission");
const line = require("../../../lib/line.notify");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { OrderApppremium } = require("../../../model/apppremium/order.apppremium.model");
const { AppPremiumBooking } = require("../../../model/apppremium/apppremium.model");

const uploadFolder = path.join(__dirname, '../../../assets/act');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: function (req, file, cb) {
        cb(null, 'act' + "-" + Date.now() + file.originalname);
    },
});

module.exports.create = async (req, res) => {
    try {
        if (req.body.shop_type === 'One Stop Service') {
            await checkEmployee(req, res);
        } else if (req.body.shop_type === 'One Stop Platform') {
            // comsole.log('ยังไม่พร้อมใช้งาน')
            await checkMember(req, res);
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
                const artwork = await PriceArtworks.findOne({
                    _id: item.priceid,
                    product_id: item.packageid
                });
                const total = artwork.price + artwork.freight;
                const net = total * item.quantity;
                product_price += net;
            }
            if (shop.shop_wallet < product_price) {
                return res.status(403).send({ status: false, message: "ยอดเงินในระบบไม่เพียงพอ" });
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
                    const artwork = await PriceArtworks.findOne({ _id: item.priceid, product_id: item.packageid });
                    if (artwork) {
                        const product = await ProductArtworks.findOne({ _id: item.packageid });
                        if (product) {
                            if (product.detail === 'ราคาต่อตารางเมตร') {
                                packagedetail = `${item.width} * ${item.height}, ${product.description}, ${item.packagedetail}`;
                                const data = (item.width / 100) * (item.height / 100);
                                const result = Math.round(data);
                                if (result < 1) {
                                    total_price = artwork.price * item.quantity;
                                    total_cost = artwork.cost * item.quantity;
                                    total_freight = artwork.freight * item.quantity;
                                    total_platfrom = artwork.service.platform * item.quantity;
                                    profit = artwork.service.profit_TG * item.quantity;
                                    profit_shop = artwork.service.profit_shop * item.quantity;
                                } else {
                                    total_price = (artwork.price * result) * item.quantity;
                                    total_cost = (artwork.cost * result) * item.quantity;
                                    total_freight = artwork.freight + ((result - 1) * 10) * item.quantity;
                                    total_platfrom = (artwork.service.platform * result) * item.quantity;
                                    profit = (artwork.service.profit_TG * result) * item.quantity;
                                    profit_shop = (artwork.service.profit_shop * result) * item.quantity;
                                }
                                // } 
                                // else if (product.detail === 'ราคาต่อชิ้น') {
                                // packagedetail = `${product.description}, ${item.packagedetail}`
                                // total_price = artwork.price * item.quantity;
                                // total_cost = artwork.cost * item.quantity;
                                // total_platfrom = artwork.service.platform * item.quantity;
                                // total_freight = artwork.freight * item.quantity;
                            } else if (product.detail === 'ราคาต่อชุด' || product.detail === 'ราคาต่อชิ้น') {
                                packagedetail = `${product.description}, ${item.packagedetail}`
                                total_price = artwork.price * item.quantity;
                                total_cost = artwork.cost * item.quantity;
                                total_platfrom = artwork.service.platform * item.quantity;
                                profit = artwork.service.profit_TG * item.quantity;
                                profit_shop = artwork.service.profit_shop * item.quantity;
                                if (item.quantity > 5) {
                                    const value = item.quantity / 5;
                                    const result_value = Math.trunc(value);
                                    const total_value = result_value * 10;
                                    total_freight = artwork.freight + total_value;
                                } else {
                                    total_freight = artwork.freight;
                                }
                            }
                            order.push({
                                packageid: artwork.product_id,
                                priceid: artwork._id,
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
                    servicename: "Artwork",
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
                        name: "รอดำเนินการ",
                        timestamp: dayjs(Date.now()).format(""),
                    },
                    timestamp: dayjs(Date.now()).format(""),
                };
                const new_order = new OrderServiceModels(data);
                const formOrderOffice = {
                    receiptnumber: invoice,
                    detail: "Graphics",
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
                    const newwallet = shop.shop_wallet - ((totalprice - totalprofitshop) + totalfreight);
                    await Shops.findByIdAndUpdate(shop._id, { shop_wallet: newwallet }, { useFindAndModify: false });

                    // จ่ายค่าคอมมิชชั่น
                    const commissionData = await commissions.Commission(new_order, totalplatform, getteammember, 'Artwork', (totalprice + totalfreight));
                    const commission = new Commission(commissionData);
                    if (!commission) {
                        return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
                    } else {
                        commission.save();
                        const wallethistory = {
                            maker_id: req.body.maker_id,
                            shop_id: shop._id,
                            orderid: new_order._id,
                            name: `รายการสั่งซื้อ Artwork ใบเสร็จเลขที่ ${new_order.invoice}`,
                            type: "เงินออก",
                            category: 'Wallet',
                            before: shop.shop_wallet, // ก่อน
                            after: shop.shop_wallet - new_order.net, // หลัง
                            amount: new_order.net,
                        };
                        const wallethistoryone = {
                            maker_id: req.body.maker_id,
                            shop_id: shop._id,
                            orderid: new_order._id,
                            name: `รายการสั่งซื้อ Artwork ใบเสร็จเลขที่ ${new_order.invoice}`,
                            type: "เงินเข้า",
                            category: 'Wallet',
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
};

const checkMember = async (req, res) => {
    try {
        const member = await Members.findOne({ _id: req.body.maker_id });
        if (!member) {
            return res.status(403).send({ message: "ไม่พบข้อมูลสมาชิก" });
        } else {
            let product_price = 0;
            for (let item of req.body.product_detail) {
                const artwork = await PriceArtworks.findOne({
                    _id: item.priceid,
                    product_id: item.packageid
                });
                const total = artwork.price + artwork.freight;
                const net = total * item.quantity;
                product_price += net;
            }
            if (member.wallet < product_price) {
                return res.status(403).send({ status: false, message: "ยอดเงินในระบบไม่เพียงพอ" });
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
                    const artwork = await PriceArtworks.findOne({ _id: item.priceid, product_id: item.packageid });
                    if (artwork) {
                        const product = await ProductArtworks.findOne({ _id: item.packageid });
                        if (product) {
                            if (product.detail === 'ราคาต่อตารางเมตร') {
                                packagedetail = `${item.width} * ${item.height}, ${product.description}, ${item.packagedetail}`;
                                const data = (item.width / 100) * (item.height / 100);
                                const result = Math.round(data);
                                if (result < 1) {
                                    total_price = artwork.price * item.quantity;
                                    total_cost = artwork.cost * item.quantity;
                                    total_freight = artwork.freight * item.quantity;
                                    total_platfrom = artwork.platform.platform * item.quantity;
                                    profit = artwork.platform.profit_TG * item.quantity;
                                    profit_shop = artwork.platform.profit_shop * item.quantity;
                                } else {
                                    total_price = (artwork.price * result) * item.quantity;
                                    total_cost = (artwork.cost * result) * item.quantity;
                                    total_freight = artwork.freight + ((result - 1) * 10) * item.quantity;
                                    total_platfrom = (artwork.platform.platform * result) * item.quantity;
                                    profit = (artwork.platform.profit_TG * result) * item.quantity;
                                    profit_shop = (artwork.platform.profit_shop * result) * item.quantity;
                                }
                                // } 
                                // else if (product.detail === 'ราคาต่อชิ้น') {
                                // packagedetail = `${product.description}, ${item.packagedetail}`
                                // total_price = artwork.price * item.quantity;
                                // total_cost = artwork.cost * item.quantity;
                                // total_platfrom = artwork.service.platform * item.quantity;
                                // total_freight = artwork.freight * item.quantity;
                            } else if (product.detail === 'ราคาต่อชุด' || product.detail === 'ราคาต่อชิ้น') {
                                packagedetail = `${product.description}, ${item.packagedetail}`
                                total_price = artwork.price * item.quantity;
                                total_cost = artwork.cost * item.quantity;
                                total_platfrom = artwork.platform.platform * item.quantity;
                                profit = artwork.platform.profit_TG * item.quantity;
                                profit_shop = artwork.platform.profit_shop * item.quantity;
                                if (item.quantity > 5) {
                                    const value = item.quantity / 5;
                                    const result_value = Math.trunc(value);
                                    const total_value = result_value * 10;
                                    total_freight = artwork.freight + total_value;
                                } else {
                                    total_freight = artwork.freight;
                                }
                            }
                            order.push({
                                packageid: artwork.product_id,
                                priceid: artwork._id,
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
                }
                const totalprice = order.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0);
                const totalcost = order.reduce((accumulator, currentValue) => accumulator + currentValue.cost, 0);
                const totalfreight = order.reduce((accumulator, currentValue) => accumulator + currentValue.freight, 0);
                const totalplatform = order.reduce((accumulator, currentValue) => accumulator + currentValue.platform, 0);
                const totalprofit = order.reduce((accumulator, currentValue) => accumulator + currentValue.profit, 0);
                const totalprofitshop = order.reduce((accumulator, currentValue) => accumulator + currentValue.profit_shop, 0);

                const invoice = await GenerateRiceiptNumber(req.body.shop_type, '', '');

                const data = {
                    invoice: invoice,
                    maker_id: req.body.maker_id,
                    platform: req.body.platform,
                    customer_name: req.body.customer_name,
                    customer_tel: req.body.customer_tel,
                    customer_address: req.body.customer_address,
                    customer_iden: req.body.customer_iden,
                    customer_line: req.body.customer_line,
                    product_detail: order,
                    shop_type: req.body.shop_type,
                    paymenttype: req.body.paymenttype,
                    servicename: "Artwork",
                    profit: totalprofit,
                    profit_shop: totalprofitshop,
                    cost: totalcost,
                    price: totalprice,
                    freight: totalfreight,
                    net: totalprice + totalfreight,
                    totalplatform: totalplatform,
                    moneyreceive: req.body.moneyreceive,
                    employee: req.body.employee,
                    change: req.body.moneyreceive - (totalprice + totalfreight),
                    status: {
                        name: "รอดำเนินการ",
                        timestamp: dayjs(Date.now()).format(""),
                    },
                    timestamp: dayjs(Date.now()).format(""),
                };
                const new_order = new OrderServiceModels(data);
                const formOrderOffice = {
                    receiptnumber: invoice,
                    detail: "Graphics",
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
                    const newwallet = member.wallet - ((totalprice - totalprofitshop) + totalfreight);
                    await Members.findByIdAndUpdate(member._id, { wallet: newwallet }, { useFindAndModify: false });

                    // จ่ายค่าคอมมิชชั่น
                    const commissionData = await commissions.Commission(new_order, totalplatform, getteammember, 'Artwork', (totalprice + totalfreight));
                    const commission = new Commission(commissionData);
                    if (!commission) {
                        return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
                    } else {
                        commission.save();
                        const wallethistory = {
                            maker_id: req.body.maker_id,
                            orderid: new_order._id,
                            name: `รายการสั่งซื้อ Artwork ใบเสร็จเลขที่ ${new_order.invoice}`,
                            type: "เงินออก",
                            category: 'Wallet',
                            before: member.wallet,
                            after: member.wallet - new_order.net,
                            amount: new_order.net,
                        };
                        const wallethistoryone = {
                            maker_id: req.body.maker_id,
                            orderid: new_order._id,
                            name: `รายการสั่งซื้อ Artwork ใบเสร็จเลขที่ ${new_order.invoice}`,
                            type: "เงินเข้า",
                            category: 'Wallet',
                            before: member.wallet - new_order.net,
                            after: (member.wallet - new_order.net) + totalprofitshop,
                            amount: totalprofitshop,
                        };
                        const walletHistory = new WalletHistory(wallethistory);
                        const walletHistoryone = new WalletHistory(wallethistoryone);
                        if (!walletHistory) {
                            return res.status(403).send({ status: false, message: 'ไม่สามารถบันทึกประวัติการเงินได้' });
                        } else {
                            walletHistory.save();
                            console.log('- - บันทึกประวัติเงินออกสำเร็จ - -')
                            walletHistoryone.save();
                            console.log('- - บันทึกประวัติเงินเข้าสำเร็จ - -')
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
        const data = `TG${dayjs(Date.now()).format("YYMM")}${number}${countValue.toString().padStart(3, "0")}`;
        return data;
    } else {
        const pipelint = [
            // {
            // $match: { shop_type: shop_type },
            // },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const count = await OrderServiceModels.aggregate(pipelint);
        const countValue = count.length > 0 ? count[0].count + 1 : 1;
        const data = `TGS${dayjs(Date.now()).format("YYMM")}${countValue.toString().padStart(3, "0")}`;
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

module.exports.confirmOrder = async (req, res) => {
    try {
        const updateStatus = await OrderServiceModels.findOne({ invoice: req.params.id });
        if (!updateStatus) {
            return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลรายการออเดอร์' });
        } else {
            updateStatus.status.push({
                name: "กำลังดำเนินการ",
                timestamp: dayjs(Date.now()).format(""),
            });
            updateStatus.save();
            return res.status(200).send({ status: true, message: 'ยืนยันรับงานสำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.submitOrder = async (req, res) => {
    try {
        const updateStatus = await OrderServiceModels.findOne({ invoice: req.params.id });
        if (!updateStatus) {
            return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลรายการออเดอร์' });
        } else {
            updateStatus.status.push({
                name: "ดำเนินการเสร็จสิ้น",
                timestamp: dayjs(Date.now()).format(""),
            });
            updateStatus.status.push({
                name: "รอจัดส่ง",
                timestamp: dayjs(Date.now()).format(""),
            });
            updateStatus.save();
            return res.status(200).send({ status: true, message: 'ยืนยันรับงานสำเร็จ' });
        }
    } catch (err) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderList = async (req, res) => {
    try {
        const order = await OrderServiceModels.find();
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderById = async (req, res) => {
    try {
        const order = await OrderServiceModels.findById(req.params.id);
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderAoc = async (req, res) => {
    try {
        const order_aoc = await OrderFlightTicket.find();
        if (order_aoc) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order_aoc })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderByMakerId = async (req, res) => {
    try {
        const id = req.params.makerid;
        const order_aoc = await OrderFlightTicket.find();
        const order_aocs = order_aoc.filter(
            (el) => el.maker_id === id
        );
        if (order_aocs) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order_aocs })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderAocById = async (req, res) => {
    try {
        const order_aoc = await OrderFlightTicket.findById(req.params.id);
        if (order_aoc) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order_aoc })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderExpress = async (req, res) => {
    try {
        const order_express = await OrderExpress.find();
        if (order_express) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order_express })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


module.exports.getOrderByShopId = async (req, res) => {
    try {
        const id = req.params.shopid;
        const pipelint = [
            {
                $match: { shop_id: id },
            }
        ];
        const order = await OrderExpress.aggregate(pipelint);
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderPurchaseId = async (req, res) => {
    try {
        const id = req.params.id;
        const pipelint = [
            {
                $match: { purchase_id: id },
            }
        ];
        const order = await shippopBooking.aggregate(pipelint);
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderAppPremium = async (req, res) => {
    try {
        const order = await OrderApppremium.find();
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderAppByShopId = async (req, res) => {
    try {
        const id = req.params.shopid;
        const pipelint = [
            {
                $match: { shop_id: id },
            }
        ];
        const order = await OrderApppremium.aggregate(pipelint);
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderAppPurchaseId = async (req, res) => {
    try {
        const id = req.params.id;
        const pipelint = [
            {
                $match: { purchase_id: id },
            }
        ];
        const order = await AppPremiumBooking.aggregate(pipelint);
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderService = async (req, res) => {
    try {
        const order = await OrderServiceModels.find();
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getOrderByInvoice = async (req, res) => {
    try {
        const order = await OrderActRefModels.findOne({ invoice: req.params.invoice });
        if (order) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: order })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.updateOrderRefBook = async (req, res) => {
    try {
        const id = req.params.id;
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            OrderActRefModels.findByIdAndUpdate(id, { ...req.body, book: req.file.filename }, { useFindAndModify: false }).then((data) => {
                if (!data) {
                    fs.unlinkSync(req.file.path);
                    return res.status(404).send({
                        status: false,
                        message: `เพิ่มรูปภาพไม่สำเร็จ!`,
                    });
                } else {
                    return res.status(201).send({
                        message: "เพิ่มรูปภาพสำเร็จ",
                        status: true,
                    });
                }
            }).catch((err) => {
                fs.unlinkSync(req.file.path);
                return res.status(500).send({
                    message: "มีบ่างอย่างผิดพลาด",
                    status: false,
                });
            })
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.updateOrderRefIden = async (req, res) => {
    try {
        const id = req.params.id;
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file)
            OrderActRefModels.findByIdAndUpdate(id, { ...req.body, iden: req.file.filename }, { useFindAndModify: false }).then((data) => {
                if (!data) {
                    fs.unlinkSync(req.file.path);
                    return res.status(404).send({
                        status: false,
                        message: `เพิ่มรูปภาพไม่สำเร็จ!`,
                    });
                } else {
                    return res.status(201).send({
                        message: "เพิ่มรูปภาพสำเร็จ",
                        status: true,
                    });
                }
            }).catch((err) => {
                fs.unlinkSync(req.file.path);
                return res.status(500).send({
                    message: "มีบ่างอย่างผิดพลาด",
                    status: false,
                });
            })
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getByShopId = async (req, res) => {
    try {
        const order = await OrderServiceModels.find();
        const orders = order.filter(
            (el) => el.shop_id === req.params.shopid
        );
        if (orders) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: orders })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports.getByMakerId = async (req, res) => {
    try {
        const order = await OrderServiceModels.find();
        const orders = order.filter(
            (el) => el.maker_id === req.params.makerid
        );
        if (orders) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลออเดอร์สำเร็จ', data: orders })
        } else {
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};