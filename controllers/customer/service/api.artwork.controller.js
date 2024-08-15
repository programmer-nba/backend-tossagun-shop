const path = require("path");
const { ProductArtworks } = require("../../../model/service/artwork/artwork.model");
const { CategoryArtworks } = require("../../../model/service/artwork/category.model");
const { PriceArtworks } = require("../../../model/service/artwork/price.model");
const { Customers } = require("../../../model/user/customer.model");

module.exports.getProductArtwork = async (req, res) => {
	try {

		// Develment
		const api_image = `https://api.tossaguns.com/tossagun-shop/product/api_service/image/`
		// Production
		// const api_image = `https://api.tossaguns.com/tossagun-shop/product/api_service/image/`

		const pipeline = [
			{
				$lookup: {
					from: 'artwork_category',
					localField: 'category',
					foreignField: '_id',
					as: 'categoryDetails'
				}
			},
			{
				$project: {
					_id: 0,
					createAt: 1,
					product_id: '$_id',
					product_name: '$name',
					product_detail: '$description',
					product_category: '$categoryDetails',
					product_image: { $concat: [api_image, `$image`] },
				}
			}
		];

		const product = await ProductArtworks.aggregate(pipeline);

		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });

	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getProductPrice = async (req, res) => {
	try {
		const cus_id = req.decoded.id;
		const product_id = req.params.id;
		const pipelint = [
			{
				$match: { product_id: product_id },
			},
		];
		const prices = await PriceArtworks.aggregate(pipelint);
		const product = await ProductArtworks.findOne({ _id: product_id });

		// ค้นหาลูกค้า
		const findCustomer = await Customers.findOne({ _id: cus_id });
		if (!findCustomer) {
			return res
				.status(404)
				.send({ status: false, message: "ไม่พบข้อมูลลูกค้าดังกล่าว" })
		}
		let p = findCustomer.cus_function.find((el) => el.name === 'artwork');
		// console.log(p)
		if (!p) {
			console.log(`ยังไม่ได้กำหนดเปอร์เซนต์ให้ลูกค้า`);
		}

		const cost = Number(prices[0].cost);
		const price = Math.ceil(((cost * p.percent) / 100) + cost);

		const new_data = {
			detail: product.detail,
			cost_tg: cost,
			price: price,
			freight: prices[0].freight,
		};

		return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: new_data });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getProductImage = async (req, res) => {
	try {
		const imgname = req.params.imagename;
		const imagePath = path.join(__dirname, '../../../assets/artwork', imgname);
		return res.sendFile(imagePath);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ status: false, message: "Internal Server Error" });
	}
};