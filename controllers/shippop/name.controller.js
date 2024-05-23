const { NameExpress } = require("../../model/shippop/name.model");

module.exports.create = async (req, res) => {
	try {
		const name = await NameExpress.findOne({ name: req.body.name });
		if (name)
			return res.status(409).send({
				status: false,
				message: "มีชื่อนี้ในระบบแล้ว",
			});
		await new NameExpress({
			...req.body,
		}).save();
		return res.status(201).send({ message: "เพิ่มข้อมูลสำเร็จ", status: true });
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getAll = async (req, res) => {
	try {
		const name = await NameExpress.find();
		if (!name)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: name });
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getById = async (req, res) => {
	try {
		const name = await NameExpress.findOne({ _id: req.params.id });
		if (!name)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: name });
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.update = async (req, res) => {
	try {
		const id = req.params.id;
		await NameExpress.findByIdAndUpdate(id, {
			...req.body
		}, { useFindAndModify: false }).then((data) => {
			if (!data) {
				return res.status(403).send({
					message: "แก้ไขชื่อไม่สำเร็จ",
					status: true,
				});
			} else {
				return res.status(200).send({
					message: "แก้ไขชื่อสำเร็จ",
					status: true,
				});
			}
		}).catch((err) => {
			return res.status(500).send({ message: "ไม่สามารถแก้ไขรายงานนี้ได้", status: false, });
		})
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.delete = async (req, res) => {
	try {
		const id = req.params.id;
		await NameExpress.findByIdAndDelete(id, {
			useFindAndModify: false
		}).then((data) => {
			if (!data) {
				return res.status(403).send({
					message: "ลบข้อมูลชื่อไม่สำเร็จ",
					status: true,
				});
			} else {
				return res.status(200).send({
					message: "ลบข้อมูลชื่อสำเร็จ",
					status: true,
				});
			}
		}).catch((err) => {
			return res.status(500).send({ message: "ไม่สามารถลบรายงานนี้ได้", status: false, });
		})
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};