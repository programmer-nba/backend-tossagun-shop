const router = require("express").Router()
const artwork = require("../../controllers/service.controller/artwork/artwork.controller")
const category = require("../../controllers/service.controller/artwork/creategory.controller")
const price = require("../../controllers/service.controller/artwork/price.controller")
const order = require("../../controllers/service.controller/order/order.service.controller")
const authAdmin = require("../../lib/auth.admin")
const auth = require("../../lib/auth")
const authPlatform = require("../../lib/auth.platform")

router.get("/image/:imgname", artwork.getImage)

// Category
router.post("/category", authAdmin, category.create)
router.get("/category", auth, category.getCategoryAll)
router.get("/category/platform", authPlatform, category.getCategoryAll)
router.get("/category/:id", auth, category.getCategoryById)
router.get("/category/platform/:id", authPlatform, category.getCategoryById)
router.put("/category/:id", authAdmin, category.updateCategory)
router.delete("/category/:id", authAdmin, category.deleteCategory)

// Product
router.post("/", authAdmin, artwork.create)
router.get("/", auth, artwork.getProductAll)
router.get("/platform", authPlatform, artwork.getProductAll)
router.get("/:id", auth, artwork.getProductById)
router.get("/platform/:id", authPlatform, artwork.getProductById)
router.get("/cate/:cateid", auth, artwork.getProductByCategoryId)
router.put("/:id", authAdmin, artwork.updateProduct)
router.delete("/:id", authAdmin, artwork.deleteProduct)

// Price
router.post("/price", authAdmin, price.create)
router.get("/price/all", auth, price.getPriceAll)
router.get("/price/:id", auth, price.getPriceById)
router.get("/price/product/:productid", auth, price.getPriceByProductId)
router.put("/price/:id", authAdmin, price.updatePrice)
router.delete("/price/:id", authAdmin, price.deletePrice)

router.post("/order", auth, order.create);

module.exports = router;