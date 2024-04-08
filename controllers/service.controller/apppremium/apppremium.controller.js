const axios = require("axios");

module.exports.getProductAll = async (req, res) => {
    try {
        const config = {
            method: "GET",
            headers: {
                'apikey': `${process.env.APPPREMIUM_KEY}`
            },
            url: `${process.env.APPPREMIUM_URL}api_product`,
        };
        const response = await axios(config);
        console.log(response);
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
}