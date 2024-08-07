const Joi = require("joi");
const dayjs = require("dayjs");
const { Members } = require("../model/user/member.model");
const { WalletHistory } = require("../model/wallet/wallet.history.model");
const { MoneySavings } = require("../model/wallet/money.save.model");
const { Percents } = require("../model/pos/commission/percent.model");

const validate_commission = (data) => {
	const schema = Joi.object({
		invoice: Joi.string().required().label("ไม่พบเลขที่ใบเสร็จ"),
		tel: Joi.string().required().label("ไม่พบเบอร์ผู้ใช้ platform"),
		platform: {
			owner: Joi.number().required().label("ไม่พบไม่ได้ของบัญชีที่รับเอง"),
			lv1: Joi.number().required().label("ไม่พบรายได้ชั้นที่ 1"),
			lv2: Joi.number().required().label("ไม่พบรายได้ชั้นที่ 2"),
			lv3: Joi.number().required().label("ไม่พบรายได้ชั้นที่ 3"),
		},
		// allsale: Joi.number().required().label("ไม่พบรายได้ allsale"),
		central: {
			central: Joi.number().required().label("ไม่พบยอดกองทุน"),
			allsale: Joi.number().required().label("ไม่พบยอด all sale"),
		},
		emp_bonus: Joi.number().required().label("ไม่พบยอดโบนัสพนักงาน"),
		happypoint: Joi.number().required().label("ไม่พบยอด Happy Point"),
	});
	return schema.validate(data);
};

const vat3percent = (num) => {
	const vat = (num * 3) / 100;
	const amount = num - vat;
	const total = {
		amount: amount, //ยอดที่หัก vat เรียบร้อยแล้ว
		vat: vat, //ยอดvat ที่หาได้
	};
	return total;
};

async function GiveCommission(packageData) {
	try {
		const { error } = validate_commission(packageData);
		if (error) {
			return res.status(400).send({ status: false, message: error.details[0].message });
		}
		const member = await Members.findOne({ tel: packageData.tel });
		if (!member) {
			return res.status(403).send({ status: false, message: 'เบอร์โทรศัพท์ดังกล่าวไม่ได้เป็นสมาชิกของทศกัณฐ์แฟมมิลี่' })
		}

		let profit = 0;
		//OWNER
		const vat_owner = vat3percent(packageData.platform.owner);
		const new_money_owner = member.commission + vat_owner.amount;
		const new_allsale = member.allsale + packageData.platform.owner;
		const new_happypoint = member.happy_point + packageData.happypoint;

		await Members.findByIdAndUpdate(member._id, {
			commission: new_money_owner,
			allsale: new_allsale,
			happy_point: new_happypoint,
		}, { useFindAndModify: false, });

		//history
		const owner_history = {
			from: `${member.fristname} ${member.lastname}`,
			maker_id: member._id,
			orderid: packageData.invoice,
			type: "เงินเข้า",
			category: 'Commission',
			amount: Number(packageData.platform.owner.toFixed(2)),
			vat: Number(vat_owner.vat.toFixed(2)),
			total: Number(vat_owner.amount.toFixed(2)),
			before: Number(member.commission.toFixed(2)),
			after: Number(new_money_owner.toFixed(2)),
			name: `คอมมิชชั่นจากใบเสร็จเลขที่ ${packageData.invoice} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
			timestamp: dayjs(Date.now()).format(),
		};
		await WalletHistory.create(owner_history);

		//LV1
		if (member.upline.lv1 !== "-") {
			const mem_lv1 = await Members.findById(member.upline.lv1);
			const vat_lv1 = vat3percent(packageData.platform.lv1);
			const new_money_lv1 = mem_lv1.commission + vat_lv1.amount;
			const new_allsale_lv1 = mem_lv1.allsale + packageData.platform.lv1;
			await Members.findByIdAndUpdate(mem_lv1._id, {
				commission: new_money_lv1,
				allsale: new_allsale_lv1,
			});
			//history
			const lv1_history = {
				from: `${member.fristname} ${member.lastname}`,
				maker_id: mem_lv1._id,
				orderid: packageData.invoice,
				type: "เงินเข้า",
				category: 'Commission',
				amount: Number(packageData.platform.lv1.toFixed(2)),
				name: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ ใบเสร็จเลขที่ ${packageData.invoice} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
				vat: Number(vat_lv1.vat.toFixed(2)),
				total: Number(vat_lv1.amount.toFixed(2)),
				before: Number(mem_lv1.commission.toFixed(2)),
				after: Number(new_money_lv1.toFixed(2)),
				timestamp: dayjs(Date.now()).format(),
			};
			await WalletHistory.create(lv1_history);
		} else {
			profit = profit + packageData.platform.lv1;
		}

		//LV2
		if (member.upline.lv2 !== "-") {
			const mem_lv2 = await Members.findById(member.upline.lv2);
			const vat_lv2 = vat3percent(packageData.platform.lv2);
			const new_money_lv2 = mem_lv2.commission + vat_lv2.amount;
			const new_allsale_lv2 = mem_lv2.allsale + packageData.platform.lv2;
			await Members.findByIdAndUpdate(mem_lv2._id, {
				commission: new_money_lv2,
				allsale: new_allsale_lv2,
			});
			//history
			const lv2_history = {
				from: `${member.fristname} ${member.lastname}`,
				maker_id: mem_lv2._id,
				orderid: packageData.invoice,
				type: "เงินเข้า",
				category: 'Commission',
				amount: Number(packageData.platform.lv2.toFixed(2)),
				detail: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ ใบเสร็จเลขที่ ${packageData.invoice} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
				vat: Number(vat_lv2.vat.toFixed(2)),
				total: Number(vat_lv2.amount.toFixed(2)),
				before: Number(mem_lv2.commission.toFixed(2)),
				after: Number(new_money_lv2.toFixed(2)),
				timestamp: dayjs(Date.now()).format(),
			};
			await WalletHistory.create(lv2_history);
		} else {
			profit = profit + packageData.platform.lv2;
		}

		//LV3
		if (member.upline.lv3 !== "-") {
			const mem_lv3 = await Members.findById(member.upline.lv3);
			const vat_lv3 = vat3percent(packageData.platform.lv3);
			const new_money_lv3 = mem_lv3.commission + vat_lv3.amount;
			const new_allsale_lv3 = mem_lv3.allsale + packageData.platform.lv3;
			await Members.findByIdAndUpdate(mem_lv3._id, {
				commission: new_money_lv3,
				allsale: new_allsale_lv3,
			});
			//history
			const lv3_history = {
				from: `${member.fristname} ${member.lastname}`,
				maker_id: mem_lv3._id,
				orderid: packageData.invoice,
				type: "เงินเข้า",
				category: 'Commission',
				amount: Number(packageData.platform.lv3.toFixed(2)),
				detail: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ ใบเสร็จเลขที่ ${packageData.invoice} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
				vat: Number(vat_lv3.vat.toFixed(2)),
				total: Number(vat_lv3.amount.toFixed(2)),
				before: Number(mem_lv3.commission.toFixed(2)),
				after: Number(new_allsale_lv3.toFixed(2)),
				timestamp: dayjs(Date.now()).format(),
			};
			await WalletHistory.create(lv3_history);
		} else {
			profit = profit + packageData.platform.lv3;
		}

		//บันทึกข้อมูลลง money saving เพื่อสะสม
		const saving = {
			allsale: Number(packageData.central.allsale.toFixed(2)),
			central: Number(packageData.central.central.toFixed(2)),
			profit: Number(profit.toFixed(2)),
			emp_bonus: Number(packageData.emp_bonus.toFixed(2)),
			timestamp: dayjs(Date.now()).format(),
		};
		await MoneySavings.create(saving);
	} catch (error) {
		console.error(error);
	}
};

async function Commission(order, total_platfrom, getteammember, codeOrder, happypoint) {
	try {
		const percent = await Percents.findOne({ code: 'Service' });

		const platfromcommission = (total_platfrom * percent.percent.platform) / 100;
		const bonus = (total_platfrom * percent.percent.terrestrial) / 100;
		const allSale = (total_platfrom * percent.percent.central) / 100;

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

		const givecommission = {
			invoice: order.invoice,
			tel: order.platform,
			platform: {
				owner: owner,
				lv1: lv1,
				lv2: lv2,
				lv3: lv3,
			},
			central: {
				allsale: (allSale * percent.percent_central.allsale) / 100,
				central: (allSale * percent.percent_central.central) / 100,
			},
			emp_bonus: bonus,
			happypoint: happypoint
		};

		await GiveCommission(givecommission);

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
					commission_amount: Number(owner.toFixed(2)),
					vat3percent: Number(ownervat.toFixed(2)),
					remainding_commission: Number(ownercommission.toFixed(2)),
				};
			} else if (TeamMemberData.level == "1") {
				integratedData = {
					lv: TeamMemberData.level,
					iden: TeamMemberData.iden,
					name: TeamMemberData.name,
					address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
					tel: TeamMemberData.tel,
					commission_amount: Number(lv1.toFixed(2)),
					vat3percent: Number(lv1vat.toFixed(2)),
					remainding_commission: Number(lv1commission.toFixed(2)),
				};
			} else if (TeamMemberData.level == "2") {
				integratedData = {
					lv: TeamMemberData.level,
					iden: TeamMemberData.iden,
					name: TeamMemberData.name,
					address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
					tel: TeamMemberData.tel,
					commission_amount: Number(lv2.toFixed(2)),
					vat3percent: Number(lv2vat.toFixed(2)),
					remainding_commission: Number(lv2commission.toFixed(2)),
				};
			} else if (TeamMemberData.level == "3") {
				integratedData = {
					lv: TeamMemberData.level,
					iden: TeamMemberData.iden,
					name: TeamMemberData.name,
					address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
					tel: TeamMemberData.tel,
					commission_amount: Number(lv3.toFixed(2)),
					vat3percent: Number(lv2vat.toFixed(2)),
					remainding_commission: Number(lv3commission.toFixed(2)),
				};
			}

			if (integratedData) {
				storeData.push(integratedData);
			}
		}

		const commissionData = {
			data: storeData,
			platform: Number(platfromcommission.toFixed(2)),
			bonus: Number(bonus.toFixed(2)),
			allSale: Number(allSale.toFixed(2)),
			orderid: order._id,
			code: codeOrder,
		};

		return commissionData;
	} catch (error) {
		console.error(error);
	}
}

module.exports = { GiveCommission, Commission };
