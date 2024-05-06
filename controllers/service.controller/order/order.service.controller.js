const { OrderServiceModels, validate } = require("../../../model/service/order/order.model");

module.exports.create = async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}