const router = require("express").Router()
const artwork = require("../../controllers/service/artwork/artwork.controller")
const category = require("../../controllers/service/artwork/creategory.controller")
const price = require("../../controllers/service/artwork/price.controller")
const authAdmin = require("../../lib/auth.admin")

// Category
router.post("/category", authAdmin, category.create)
router.get("/category", authAdmin, category.getCategoryAll)
router.get("/category/:id", authAdmin, category.getCategoryById)
router.put("/category/:id", authAdmin, category.updateCategory)
router.delete("/category/:id", authAdmin, category.deleteCategory)

// Product
router.post("/", authAdmin, artwork.create)
router.get("/", authAdmin, artwork.getProductAll)
router.get("/:id", authAdmin, artwork.getProductById)
router.put("/:id", authAdmin, artwork.updateProduct)
router.delete("/:id", authAdmin, artwork.deleteProduct)

// Price
router.post("/price", authAdmin, price.create)
router.get("/price", authAdmin, price.getPriceAll)
router.get("/price/:id", authAdmin, price.getPriceById)
router.get("/price/product/:id", authAdmin, price.getPriceByProductId)
router.put("/price/:id", authAdmin, price.updatePrice)
router.delete("/price/:id", authAdmin, price.deletePrice)

module.exports = router;