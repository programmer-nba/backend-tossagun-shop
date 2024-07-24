const { Categorys } = require("../../../model/pos/product/category.model");
const { ProductTG } = require("../../../model/pos/product/product.tossagun.model");
const path = require("path");

module.exports.getProductAll = async (req, res) => {
	try {
		const product = await ProductTG.find();

		let result = [];

		for (let item of product) {

			const category = await Categorys.findOne({ _id: item.productTG_category });
			let name_cate = "";

			if (!category) {
				name_cate = "";
			} else {
				name_cate = category.name;
			}

			// Production
			// const api_image = `https://api.tossaguns.com/tossagun-shop/product/api_product/image/${item.productTG_image}`
			// Dev
			const api_image = `http://localhost:9999/tossagun-shop/product/api_product/image/${item.productTG_image}`

			// detail
			let detail = item.productTG_detail;
			detail = detail.replace("<p>", "");
			detail = detail.replace("</p>", "")

			const data = {
				product_id: item._id,
				product_image: api_image,
				product_name: item.productTG_name,
				product_detail: detail,
				product_barcode: item.productTG_barcode,
				product_price: item.productTG_cost_tg.cost_tg,
				product_package: item.productTG_pack_name,
				product_category: name_cate,
			}

			result.push(data);
		}
		return res.status(200).send(result);
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getProductImage = async (req, res) => {
	try {
		const imgname = req.params.imagename;
		const imagePath = path.join(__dirname, '../../../assets/product', imgname);
		return res.sendFile(imagePath);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ status: false, message: "Internal Server Error" });
	}
};