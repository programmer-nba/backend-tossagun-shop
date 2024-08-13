const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Customers, validate } = require("../../model/user/customer.model");

module.exports.getToken = async (req, res) => {
	try {
		const token = jwt.sign(
			{ row: 'Partner', id: req.body.customer_id },
			process.env.JWTPARTNERKEY
		);
		return res.status(200).send({ status: true, token: token });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" })
	}
};

module.exports.getWalletCus = async (req, res) => {
	// const { decoded } = req;
	try {
		let token = req.body.auth_token
		jwt.verify(token, process.env.JWTPARTNERKEY, async (err, decoded) => {
			req.user = decoded;
			if (err)
				return res.status(408).json({
					success: false,
					message: "หมดเวลาใช้งานแล้ว",
					logout: true,
					description: "Request Timeout",
				});
			const id = decoded.id;
			const customer = await Customers.findOne({ _id: id });
			if (!customer)
				return res.status(407).send({ status: false, message: "ไม่พบข้อมูลลูกค้า" });
			return res.status(201).send({ status: true, message: 'เช็คยอดเงินคงเหลือ', wallet: customer.cus_wallet })
		})
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" })
	}
};

module.exports.create = async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message, status: false });

		const firstname = await Customers.findOne({
			cus_firstname: req.body.cus_firstname,
		});
		const lastname = await Customers.findOne({
			cus_lastname: req.body.cus_lastname,
		});
		const username = await Customers.findOne({
			cus_username: req.body.cus_username
		});

		if (firstname || lastname || username) {
			return res.status(409).send({ status: false, message: "มีชื่อผู้ใช้งานนี้ในระบบเเล้ว" });
		} else {
			const salt = await bcrypt.genSalt(Number(process.env.SALT));
			const hashPassword = await bcrypt.hash(req.body.cus_password, salt);

			const new_cus = new Customers({
				...req.body,
				cus_password: hashPassword,
			});

			const token = jwt.sign(
				{ row: 'Partner', id: new_cus._id },
				process.env.JWTPARTNERKEY
			);

			new_cus.cus_token = token;
			new_cus.save();

			// await new Customers({
			// ...req.body,
			// cus_password: hashPassword,
			// cus_token: token
			// }).save();
			return res.status(201).send({ message: "สร้างข้อมูลสำเร็จ", status: true });
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.updateCustomer = async (req, res) => {
	try {
		const id = req.params.id;
		Customers.findByIdAndUpdate(id, req.body, { useFindAndModify: false }).then((data) => {
			if (!data) {
				return res.status(404).send({
					status: false,
					message: 'ไม่สามารถแก้ไขข้อมูลดังกล่าวได้',
				});
			} else {
				return res.status(201).send({
					message: "แก้ไขข้อมูลดังกล่าวสำเร็จ",
					status: true,
				});
			}
		}).catch((err) => {
			return res.status(500).send({
				message: "มีบ่างอย่างผิดพลาด",
				status: false,
			});
		});
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getCustomerAll = async (req, res) => {
	try {
		const customer = await Customers.find();
		if (!customer)
			return res.status(401).send({ message: "ดึงข้อมูลไม่าำเร็จ", status: false });
		return res.status(200).send({ message: "ดึงข้อมูลสำเร็จ", status: true, data: customer });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getCustomerById = async (req, res) => {
	try {
		const id = req.params.id;
		const customer = await Customers.findOne({ _id: id });
		if (!customer)
			return res.status(401).send({ message: "ดึงข้อมูลไม่าำเร็จ", status: false });
		return res.status(200).send({ message: "ดึงข้อมูลสำเร็จ", status: true, data: customer });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};