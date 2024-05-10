const Joi = require("joi");
const dayjs = require("dayjs");
const { Members } = require("../model/user/member.model");
const { WalletHistory } = require("../model/wallet/wallet.history.model");
const { MoneySavings } = require("../model/wallet/money.save.model");

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
		const new_allsale = member.allsale + packageData.central.allsale;

		await Members.findByIdAndUpdate(member._id, {
			commission: new_money_owner,
			allsale: new_allsale
		}, { useFindAndModify: false, });

		//history
		const owner_history = {
			from: `${member.fristname} ${member.lastname}`,
			maker_id: member._id,
			orderid: packageData.invoice,
			type: "เงินเข้า",
			category: 'Commission',
			amount: packageData.platform.owner,
			vat: vat_owner.vat,
			total: vat_owner.amount,
			before: member.commission,
			after: new_money_owner,
			name: `คอมมิชชั่นจากใบเสร็จเลขที่ ${packageData.invoice} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
			timestamp: dayjs(Date.now()).format(),
		};
		await WalletHistory.create(owner_history);

		//LV1
		if (member.upline.lv1 !== "-") {
			const mem_lv1 = await Members.findById(member.upline.lv1);
			const vat_lv1 = vat3percent(packageData.platform.lv1);
			const new_money_lv1 = mem_lv1.commission + vat_lv1.amount;
			const new_allsale_lv1 = mem_lv1.allsale + packageData.central.allsale;
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
				amount: packageData.platform.lv1,
				name: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ ใบเสร็จเลขที่ ${packageData.invoice} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
				vat: vat_lv1.vat,
				total: vat_lv1.amount,
				before: mem_lv1.commission,
				after: new_money_lv1,
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
			const new_allsale_lv2 = mem_lv2.allsale + packageData.central.allsale;
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
				amount: packageData.platform.lv2,
				detail: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ ใบเสร็จเลขที่ ${packageData.invoice} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
				vat: vat_lv2.vat,
				total: vat_lv2.amount,
				before: mem_lv2.commission,
				after: new_money_lv2,
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
			const new_allsale_lv3 = mem_lv3.allsale + packageData.central.allsale;
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
				amount: packageData.platform.lv3,
				detail: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ ใบเสร็จเลขที่ ${packageData.invoice} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
				vat: vat_lv3.vat,
				total: vat_lv3.amount,
				before: mem_lv3.commission,
				after: new_allsale_lv3,
				timestamp: dayjs(Date.now()).format(),
			};
			await WalletHistory.create(lv3_history);
		} else {
			profit = profit + packageData.platform.lv3;
		}

		//บันทึกข้อมูลลง money saving เพื่อสะสม
		const saving = {
			allsale: packageData.central.allsale,
			central: packageData.central.central,
			profit: profit,
			emp_bonus: packageData.emp_bonus,
			timestamp: dayjs(Date.now()).format(),
		};
		await MoneySavings.create(saving);
	} catch (error) {
		console.error(error);
	}
};

module.exports = { GiveCommission };
