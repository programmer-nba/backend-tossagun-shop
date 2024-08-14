const path = require("path");
const { ProductArtworks } = require("../../../model/service/artwork/artwork.model");
const { CategoryArtworks } = require("../../../model/service/artwork/category.model");

module.exports.getProductArtwork = async (req, res) => {
	try {

		// Develment
		const api_image = `https://api.tossaguns.com/tossagun-shop/product/api_service/image/`
		// Production
		// const api_image = `https://api.tossaguns.com/tossagun-shop/product/api_service/image/`

		const category = await CategoryArtworks.find();

		const pipeline = [
			{
				$lookup: {
					from: "artwork_category",
					localField: "category",
					foreignField: "_id",
					as: "category_info"
				}
			},
			{
				$project: {
					_id: 0,
					createdAt: 1,
					product_image: { $concat: [api_image, `$image`] },
					product_name: '$name',
					product_category: { $arrayElemAt: ["$category_info.name", 0] },
					product_detail: '$description',
					// product_description: '$description',
					product_rating: '$rating'
				}
			}
		];
		const product = await ProductArtworks.aggregate(pipeline);
		if (!product)
			return res.status(408).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product })
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