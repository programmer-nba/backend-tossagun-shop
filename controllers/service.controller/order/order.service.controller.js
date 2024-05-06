const { Commission } = require("../../../model/pos/commission/commission.model");
const { Percents } = require("../../../model/pos/commission/percent.model");
const { ProductArtworks } = require("../../../model/service/artwork/artwork.model");
const { PriceArtworks } = require("../../../model/service/artwork/price.model");
const { OrderServiceModels, validate } = require("../../../model/service/order/order.model");
const { Members } = require("../../../model/user/member.model");
const line = require("../../../lib/line.notify");
const { WalletHistory } = require("../../../model/wallet/wallet.history.model");

module.exports.create = async (req, res) => {
    try {
        let data;
        let wallet;
        let newwallet;
        const invoice = await GenerateRiceiptNumber();
        if (req.body.shop_type === 'One Stop Platform') {
            data = {
                maker_id: req.body.maker_id,
                invoice: invoice,
                platform: req.body.platform,
                customer_name: req.body.customer_name,
                customer_tel: req.body.customer_tel,
                customer_address: req.body.customer_address,
                customer_iden: req.body.customer_iden,
                customer_line: req.body.customer_line,
                product_detail: req.body.product_detail,
                shop_type: req.body.shop_type,
                paymenttype: req.body.paymenttype,
                position_emp: 'Graphics',
                cost: req.body.cost,
                price: req.body.price,
                freight: req.body.freight,
                moneyreceive: req.body.moneyreceive,
                change: req.body.change,
                status: {
                    name: "รอการตรวจสอบ",
                    timestamp: dayjs(Date.now()).format(""),
                },
                timestamp: dayjs(Date.now()).format(""),
            };
            const member = await Members.findOne({ _id: req.body.maker_id });
            wallet = member.wallet;
            newwallet = member.wallet;
            await Members.findByIdAndUpdate(member._id, { wallet: newwallet }, { useFindAndModify: false })
        }
        const getteammember = await GetTeamMember(req.body.platform);
        const order = new OrderServiceModels(data);
        if (!getteammember) {
            return res.status(401).send({ stauts: false, message: 'ไม่พบข้อมูลลูกค้า' })
        } else {
            order.save();

            const code = "Service";
            const percent = await Percents.findOne({ code: code });
            const commisstion = req.body.commisstion;
            const platfromcommission = (commisstion * percent.percent.platform) / 100;
            const bonus = (commisstion * percent.percent.terrestrial) / 100;
            const allSale = (commisstion * percent.percent.central) / 100;

            const validLevel = getteammember.filter((item) => item !== null);
            const storeData = [];
            // calculation from 80% for member
            const owner = (platfromcommission * percent.percent_platform.level_owner) / 100;
            const lv1 = (platfromcommission * percent.percent_platform.level_one) / 100;
            const lv2 = (platfromcommission * percent.percent_platform.level_two) / 100;
            const lv3 = (platfromcommission * percent.percent_platform.level_tree) / 100;
            // calculation vat 3%
            const ownervat = (owner * 3) / 100;
            const lv1vat = (lv1 * 3) / 100;
            const lv2vat = (lv2 * 3) / 100;
            const lv3vat = (lv3 * 3) / 100;
            // real commission for member
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
                }
                if (TeamMemberData.level == "1") {
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
                }
                if (TeamMemberData.level == "2") {
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
                }
                if (TeamMemberData.level == "3") {
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
                platform: platfromcommission,
                bonus: bonus,
                allSale: allSale,
                orderid: order._id,
                code: "Artwork",
            };
            const commission = new Commission(commissionData);
            if (commission) {
                commission.save();
                let wallethistory;
                if (req.body.shop_type === 'One Stop Platform') {
                    wallethistory = {
                        maker_id: req.body.maker_id,
                        orderid: order._id,
                        name: `รายการสิ่งสื่อสิ่งพิมพ์ใบเสร็จเลขที่ ${order.invoice}`,
                        type: "เงินออก",
                        before: wallet,
                        after: newwallet,
                        amount: order.price,
                    }
                }
                const walletHistory = new WalletHistory(wallethistory);
                walletHistory.save();
                const message = `
แจ้งงานเข้า : สื่อสิ่งพิมพ์
เลขที่ทำรายการ : ${order.invoice}
แผนก : ${order.position_emp}
ตรวจสอบได้ที่ : https://office.ddscservices.com/

*ฝากแอดมินรบกวนตรวจสอบด้วยนะคะ/ครับ*`
                await line.linenotify(message);
                return res.status(200).send({ status: true, message: 'ทำรายการสำเร็จ', data: order })
            } else {
                console.error(error);
                return res.status(403).send({
                    message: "ไม่สามารถบันทึกได้",
                    error: error.message,
                });
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
