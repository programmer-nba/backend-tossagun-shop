const { Types, validate } = require("../../../model/pos/product/type.model");

module.exports.create = async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error) {
			return res
				.status(400)
				.send({ status: false, message: error.details[0].message });
		}
		const type = await Types.findOne({ name: req.body.name });
		if (type) {
			return res
				.status(400)
				.send({ status: false, message: "มีประเภทสินค้าย่อยนี้ในระบบแล้ว" });
		}
		const new_type = new Types(req.body);
		if (new_type) {
			new_type.save();
			return res.status(200).send({ status: true, message: new_type });
		} else {
			return res.status(403).send({ status: false, message: 'เพิ่มข้อมูลไม่สำเร็จ' });
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getTypeAll = async (req, res) => {
	try {
		const type = await Types.find();
		if (type) {
			return res.status(200).send({ status: true, message: type });
		} else {
			return res.status(403).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' });
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getTypeById = async (req, res) => {
	try {
		const id = req.params.id;
		const type = await Types.findOne({ _id: id });
		if (type) {
			return res.status(200).send({ status: true, message: type });
		} else {
			return res.status(403).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' });
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.update = async (req, res) => {
	try {
		const id = req.params.id;
		const { error } = validate(req.body);
		if (error) {
			return res
				.status(400)
				.send({ status: false, message: error.details[0].message });
		}
		const type = await Types.findByIdAndUpdate(id, req.body);
		if (type) {
			return res.status(200).send({ status: true, message: "แก้ไขข้อมูลสำเร็จ" });
		} else {
			return res.status(403).send({ status: false, message: 'แก้ไขข้อมูลไม่สำเร็จ' });
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.delete = async (req, res) => {
	try {
		const id = req.params.id;
		const type = await Types.findByIdAndDelete(id);
		if (type) {
			return res.status(200).send({ status: true, message: "ลบข้อมูลสำเร็จ" });
		} else {
			return res.status(403).send({ status: false, message: 'ลบข้อมูลไม่สำเร็จ' });
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" });
	}
};