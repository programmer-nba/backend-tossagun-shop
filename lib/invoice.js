const { OrderApppremium } = require("../model/apppremium/order.apppremium.model");
const { OrderServiceModels } = require("../model/service/order/order.model");
const { OrderExpress } = require("../model/shippop/order.express.model");
const { OrderTopup } = require("../model/topup/order.topup");

async function GenerateRiceiptNumber(shop_type, id, number) {
	if (shop_type === 'One Stop Shop') {

	} else {
		const pipelint = [
			{
				$group: { _id: 0, count: { $sum: 1 } },
			},
		];
		const count = await OrderExpress.aggregate(pipelint);
		const count1 = await OrderTopup.aggregate(pipelint);
		const count2 = await OrderServiceModels.aggregate(pipelint);
		const count3 = await OrderApppremium.aggregate(pipelint);

		const countValue = count.length > 0 ? count[0].count + 1 : 1;
	}
};