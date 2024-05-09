const { Commission } = require("../../../model/pos/commission/commission.model");
const { Percents } = require("../../../model/pos/commission/percent.model");
const { ProductArtworks } = require("../../../model/service/artwork/artwork.model");
const { PriceArtworks } = require("../../../model/service/artwork/price.model");
const { OrderServiceModels, validate } = require("../../../model/service/order/order.model");
const { OrderFlightTicket } = require("../../../model/AOC/api.service.models/aoc.tricket.model")
const { Members } = require("../../../model/user/member.model");
const line = require("../../../lib/line.notify");
const { WalletHistory } = require("../../../model/wallet/wallet.history.model");
const { shippopBooking } = require("../../../model/shippop/shippop.order");
const { Shops } = require("../../../model/pos/shop.model");
const dayjs = require("dayjs");

module.exports.create = async (req, res) => {
    try {
        if (req.body.shop_type === 'One Stop Service') {
            await checkEmployee(req, res);
        } else {
            const member = await Members.findOne({ _id: req.body.maker_id });
            if (!member) {
                return res.status(403).send({ message: "ไม่พบข้อมูลผู้ใช้" });
            } else {
                let product_price = 0;
                for (let item of req.body.product_detail) {
                    const artwork = await PriceArtworks.findOne({ _id: item.priceid, product_id: item.packageid });
                    const total = artwork.price + artwork.freight;
                    product_price += total;
                }
                if (member.wallet < product_price) {
                    return res.status(403).send({ status: false, message: "ยอดเงินในระบบไม่เพียงพอ", });
                } else {
                    const order = [];
                    let packagedetail;
                    let total_price = 0;
                    let total_cost = 0;
                    let total_freight = 0;
                    let total_platfrom = 0;

                    for (let item of req.body.product_detail) {
                        const artwork = await PriceArtworks.findOne({ _id: item.priceid, product_id: item.packageid });
                        if (artwork) {
                            const product = await ProductArtworks.findOne({ _id: item.packageid });
                            if (product) {
                                if (product.detail === 'ราคาต่อตารางเมตร') {
                                    packagedetail = `${item.width} * ${item.height}, ${product.description}, ${item.detail}`;
                                    const data = (item.width / 100) * (item.height / 100);
                                    if (data < 1) {
                                        total_price = artwork.price * item.quantity;
                                        total_cost = artwork.cost * item.quantity;
                                        total_freight = artwork.freight * item.quantity;
                                        total_platfrom = artwork.platform.platform * item.quantity;
                                    } else {
                                        total_price = (artwork.price * ((item.width / 100) * (item.height / 100))) * item.quantity;
                                        total_cost = (artwork.cost * ((item.width / 100) * (item.height / 100))) * item.quantity;
                                        total_freight = (artwork.freight * (((item.width / 100) * (item.height / 100)) - 1 * 10)) * item.quantity;
                                        total_platfrom = artwork.platform.platform * item.quantity;
                                    }
                                } else if (product.detail === 'ราคาต่อชิ้น') {
                                    packagedetail = `${product.description}, ${item.detail}`
                                    total_price = artwork.price * item.quantity;
                                    total_cost = artwork.cost * item.quantity;
                                    total_platfrom = artwork.platform.platform * item.quantity;
                                    total_freight = artwork.freight * item.quantity;
                                } else if (product.detail === 'ราคาต่อชุด') {
                                    packagedetail = `${product.description}, ${item.detail}`
                                    total_price = artwork.price * item.quantity;
                                    total_cost = artwork.cost * item.quantity;
                                    total_platfrom = artwork.platform.platform * item.quantity;
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
                                    print: total_price,
                                    cost: total_cost,
                                    freight: total_freight,
                                });
                            } else {
                                return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลสินค้า' });
                            }
                        }
                    }
                    const totalprice = order.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0);
                    const totalcost = order.reduce((accumulator, currentValue) => accumulator + currentValue.cost, 0);
                    const totalfreight = order.reduce((accumulator, currentValue) => accumulator + currentValue.freight, 0);

                    // ตัดเงิน
                    const newwallet = member.wallet - (totalprice + totalfreight);
                    await Members.findByIdAndUpdate(member._id, { wallet: newwallet }, { useFindAndModify: false });

                    const invoice = await GenerateRiceiptNumber();
                    const data = {
                        invoice: invoice,
                        maker_id: member._id,
                        customer_name: req.body.customer_name,
                        customer_tel: req.body.customer_tel,
                        customer_address: req.body.customer_address,
                        customer_iden: req.body.customer_iden,
                        customer_line: req.body.customer_line,
                        product_detail: order,
                        shop_type: req.body.shop_type,
                        paymenttype: req.body.paymenttype,
                        servicename: "Artwork",
                        cost: totalcost,
                        price: totalprice,
                        freight: totalfreight,
                        net: totalprice + totalfreight,
                        moneyreceive: req.body.moneyreceive,
                        change: req.body.change,
                        status: {
                            name: "รอดำเนินการ",
                            timestamp: dayjs(Date.now()).format(""),
                        },
                        timestamp: dayjs(Date.now()).format(""),
                    };
                    const new_order = new OrderServiceModels(data);
                    const getteammember = await GetTeamMember(req.body.platform);
                    if (!getteammember) {
                        return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
                    } else {
                        new_order.save(async (error, response) => {
                            if (response) {
                                const percent = await Percents.findOne({ code: 'Service' });

                                const commisstion = total_platfrom;
                                const platfromcommission = (commisstion * percent.percent.platform) / 100;
                                const bonus = (commisstion * percent.percent.terrestrial) / 100;
                                const allSale = (commisstion * percent.percent.central) / 100;

                                const level = getteammember.data;
                                const validLevel = level.filter((item) => item !== null);
                                const storeData = [];

                                const owner = (platfromcommission * percent.percent_platform.level_owner) / 100;
                                const lv1 = (platfromcommission * percent.percent_platform.level_one) / 100;
                                const lv2 = (platfromcommission * percent.percent_platform.level_two) / 100;
                                const lv3 = (platfromcommission * percent.percent_platform.level_tree) / 100;

                                const ownervat = (owner * 3) / 100;
                                const lv1vat = (lv1 * 3) / 100;
                                const lv2vat = (lv2 * 3) / 100;
                                const lv3vat = (lv3 * 3) / 100;

                                const ownercommission = owner - ownervat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
                                const lv1commission = lv1 - lv1vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
                                const lv2commission = lv2 - lv2vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
                                const lv3commission = lv3 - lv3vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน

                                for (const TeamMemberData of validLevel) {
                                    let integratedData;

                                    if (TeamMemberData.level == "owner") {
                                        integratedData = {
                                            lv: TeamMemberData.level,
                                            iden: TeamMemberData.iden,
                                            name: TeamMemberData.name,
                                            address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                                            tel: TeamMemberData.tel,
                                            commission_amount: owner,
                                            vat3percent: ownervat,
                                            remainding_commission: ownercommission,
                                        };
                                    } else if (TeamMemberData.level == "1") {
                                        integratedData = {
                                            lv: TeamMemberData.level,
                                            iden: TeamMemberData.iden,
                                            name: TeamMemberData.name,
                                            address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                                            tel: TeamMemberData.tel,
                                            commission_amount: lv1,
                                            vat3percent: lv1vat,
                                            remainding_commission: lv1commission,
                                        };
                                    } else if (TeamMemberData.level == "2") {
                                        integratedData = {
                                            lv: TeamMemberData.level,
                                            iden: TeamMemberData.iden,
                                            name: TeamMemberData.name,
                                            address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                                            tel: TeamMemberData.tel,
                                            commission_amount: lv2,
                                            vat3percent: lv2vat,
                                            remainding_commission: lv2commission,
                                        };
                                    } else if (TeamMemberData.level == "3") {
                                        integratedData = {
                                            lv: TeamMemberData.level,
                                            iden: TeamMemberData.iden,
                                            name: TeamMemberData.name,
                                            address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                                            tel: TeamMemberData.tel,
                                            commission_amount: lv3,
                                            vat3percent: lv2vat,
                                            remainding_commission: lv3commission,
                                        };
                                    }

                                    if (integratedData) {
                                        storeData.push(integratedData);
                                    }
                                }

                                const commissionData = {
                                    data: storeData,
                                    platformcommission: platfromcommission,
                                    bonus: bonus,
                                    allSale: allSale,
                                    orderid: new_order._id,
                                    code: "Artwork",
                                };
                                const commission = new Commission(commissionData);
                                commission.save((error, data) => {
                                    if (error) {
                                        return res.status(403).send({ status: false, message: 'ไม่สามารถบันทึกได้' });
                                    }
                                    const wallethistory = {
                                        maker_id: member._id,
                                        orderid: new_order._id,
                                        name: `รายการสั่งซื้อ Artwork ใบเสร็จเลขที่ ${new_order.invoice}`,
                                        type: "เงินออก",
                                        before: member.wallet,
                                        after: newwallet,
                                        amount: new_order.net,
                                    };
                                    const walletHistory = new WalletHistory(wallethistory);
                                    walletHistory.save();
                                })
                                const message = `
แจ้งงานเข้า : ${new_order.servicename}
เลขที่ทำรายการ : ${new_order.invoice}
ตรวจสอบได้ที่ : https://office.ddscservices.com/
                                
*ฝากรบกวนตรวจสอบด้วยนะคะ/ครับ*`;
                                await line.linenotify(message);
                                return res.status(200).send({ status: true, data: data, ยอดเงินคงเหลือ: newwallet });
                            } else {
                                return res.status(401).send({ status: false, message: 'จ่ายค่าคอมมิชชั่นไม่สำเร็จ' });
                            }
                        });
                    }
                }
            }
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
                const artwork = await PriceArtworks.findOne({ _id: item.priceid, product_id: item.packageid });
                const total = artwork.price + artwork.freight;
                product_price += total;
            }
            if (shop.shop_wallet < product_price) {
                return res.status(403).send({ status: false, message: "ยอดเงินในระบบไม่เพียงพอ", });
            } else {
                const order = [];
                let packagedetail;
                let total_price = 0;
                let total_cost = 0;
                let total_freight = 0;
                let total_platfrom = 0;
                for (let item of req.body.product_detail) {
                    const artwork = await PriceArtworks.findOne({ _id: item.priceid, product_id: item.packageid });
                    if (artwork) {
                        const product = await ProductArtworks.findOne({ _id: item.packageid });
                        if (product) {
                            if (product.detail === 'ราคาต่อตารางเมตร') {
                                packagedetail = `${item.width} * ${item.height}, ${product.description}, ${item.packagedetail}`;
                                const data = (item.width / 100) * (item.height / 100);
                                if (data < 1) {
                                    total_price = artwork.price * item.quantity;
                                    total_cost = artwork.cost * item.quantity;
                                    total_freight = artwork.freight * item.quantity;
                                    total_platfrom = artwork.platform.platform * item.quantity;
                                } else {
                                    total_price = (artwork.price * ((item.width / 100) * (item.height / 100))) * item.quantity;
                                    total_cost = (artwork.cost * ((item.width / 100) * (item.height / 100))) * item.quantity;
                                    total_freight = (artwork.freight * (((item.width / 100) * (item.height / 100)) - 1 * 10)) * item.quantity;
                                    total_platfrom = artwork.platform.platform * item.quantity;
                                }
                            } else if (product.detail === 'ราคาต่อชิ้น') {
                                packagedetail = `${product.description}, ${item.packagedetail}`
                                total_price = artwork.price * item.quantity;
                                total_cost = artwork.cost * item.quantity;
                                total_platfrom = artwork.platform.platform * item.quantity;
                                total_freight = artwork.freight * item.quantity;
                            } else if (product.detail === 'ราคาต่อชุด') {
                                packagedetail = `${product.description}, ${item.packagedetail}`
                                total_price = artwork.price * item.quantity;
                                total_cost = artwork.cost * item.quantity;
                                total_platfrom = artwork.platform.platform * item.quantity;
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
                            });
                        } else {
                            return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลสินค้า' });
                        }
                    }
                }
                const totalprice = order.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0);
                const totalcost = order.reduce((accumulator, currentValue) => accumulator + currentValue.cost, 0);
                const totalfreight = order.reduce((accumulator, currentValue) => accumulator + currentValue.freight, 0);

                const invoice = await GenerateRiceiptNumber();
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
                    cost: totalcost,
                    price: totalprice,
                    freight: totalfreight,
                    net: totalprice + totalfreight,
                    moneyreceive: req.body.moneyreceive,
                    change: req.body.change,
                    status: {
                        name: "รอดำเนินการ",
                        timestamp: dayjs(Date.now()).format(""),
                    },
                    timestamp: dayjs(Date.now()).format(""),
                };
                const new_order = new OrderServiceModels(data);
                const getteammember = await GetTeamMember(req.body.platform);
                if (!getteammember) {
                    return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
                } else {
                    new_order.save();
                    // ตัดเงิน
                    const newwallet = shop.shop_wallet - (totalprice + totalfreight);
                    await Shops.findByIdAndUpdate(shop._id, { shop_wallet: newwallet }, { useFindAndModify: false });

                    const percent = await Percents.findOne({ code: 'Service' });

                    const commisstion = total_platfrom;
                    const platfromcommission = (commisstion * percent.percent.platform) / 100;
                    const bonus = (commisstion * percent.percent.terrestrial) / 100;
                    const allSale = (commisstion * percent.percent.central) / 100;

                    const level = getteammember;
                    const validLevel = level.filter((item) => item !== null);
                    const storeData = [];

                    const owner = (platfromcommission * percent.percent_platform.level_owner) / 100;
                    const lv1 = (platfromcommission * percent.percent_platform.level_one) / 100;
                    const lv2 = (platfromcommission * percent.percent_platform.level_two) / 100;
                    const lv3 = (platfromcommission * percent.percent_platform.level_tree) / 100;

                    const ownervat = (owner * 3) / 100;
                    const lv1vat = (lv1 * 3) / 100;
                    const lv2vat = (lv2 * 3) / 100;
                    const lv3vat = (lv3 * 3) / 100;

                    const ownercommission = owner - ownervat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
                    const lv1commission = lv1 - lv1vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
                    const lv2commission = lv2 - lv2vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน
                    const lv3commission = lv3 - lv3vat; //ใช้ค่านี้เพื่อจ่ายค่าคอมมิสชัน

                    for (const TeamMemberData of validLevel) {
                        let integratedData;

                        if (TeamMemberData.level == "owner") {
                            integratedData = {
                                lv: TeamMemberData.level,
                                iden: TeamMemberData.iden,
                                name: TeamMemberData.name,
                                address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                                tel: TeamMemberData.tel,
                                commission_amount: owner,
                                vat3percent: ownervat,
                                remainding_commission: ownercommission,
                            };
                        } else if (TeamMemberData.level == "1") {
                            integratedData = {
                                lv: TeamMemberData.level,
                                iden: TeamMemberData.iden,
                                name: TeamMemberData.name,
                                address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                                tel: TeamMemberData.tel,
                                commission_amount: lv1,
                                vat3percent: lv1vat,
                                remainding_commission: lv1commission,
                            };
                        } else if (TeamMemberData.level == "2") {
                            integratedData = {
                                lv: TeamMemberData.level,
                                iden: TeamMemberData.iden,
                                name: TeamMemberData.name,
                                address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                                tel: TeamMemberData.tel,
                                commission_amount: lv2,
                                vat3percent: lv2vat,
                                remainding_commission: lv2commission,
                            };
                        } else if (TeamMemberData.level == "3") {
                            integratedData = {
                                lv: TeamMemberData.level,
                                iden: TeamMemberData.iden,
                                name: TeamMemberData.name,
                                address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                                tel: TeamMemberData.tel,
                                commission_amount: lv3,
                                vat3percent: lv2vat,
                                remainding_commission: lv3commission,
                            };
                        }

                        if (integratedData) {
                            storeData.push(integratedData);
                        }
                    }

                    const commissionData = {
                        data: storeData,
                        platformcommission: platfromcommission,
                        bonus: bonus,
                        allSale: allSale,
                        orderid: new_order._id,
                        code: "Artwork",
                    };
                    const commission = new Commission(commissionData);
                    if (!commission) {
                        return res.status(403).send({ status: false, message: 'ไม่สามารถบันทึกได้' });
                    } else {
                        commission.save();
                        const wallethistory = {
                            maker_id: req.body.maker_id,
                            shop_id: shop._id,
                            orderid: new_order._id,
                            name: `รายการสั่งซื้อ Artwork ใบเสร็จเลขที่ ${new_order.invoice}`,
                            type: "เงินออก",
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

async function GenerateRiceiptNumber() {
    const order = await OrderServiceModels.find();
    const count = order.lenght > 0 ? order[0].count + 1 : 1;
    const data = `ART${dayjs(Date.now()).format("YYMMDD")}${count
        .toString()
        .padStart(5, "0")}`;
    return data;
};

async function GetTeamMember(tel) {
    try {
        const member = await Members.findOne({ tel: tel });
        if (!member) {
            return res
                .status(403)
                .send({ message: "เบอร์โทรนี้ยังไม่ได้เป็นสมาชิกของ NBA Platfrom" });
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
        const order_express = await shippopBooking.find();
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
        const order_express = await shippopBooking.find();
        const orders = order_express.filter(
            (el) => el.shop_id === id
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

module.exports.getOrderArtwork = async (req, res) => {
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