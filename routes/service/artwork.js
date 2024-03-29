const router = require("express").Router()
const artwork = require("../../controllers/service/artwork/artwork.controller")
const category = require("../../controllers/service/artwork/creategory.controller")
const price = require("../../controllers/service/artwork/price.controller")
const authAdmin = require("../../lib/auth.admin")
const auth = require("../../lib/auth")

// Category
router.post("/category", authAdmin, category.create)
router.get("/category", auth, category.getCategoryAll)
router.get("/category/:id", auth, category.getCategoryById)
router.put("/category/:id", authAdmin, category.updateCategory)
router.delete("/category/:id", authAdmin, category.deleteCategory)

// Product
router.post("/", authAdmin, artwork.create)
router.get("/", auth, artwork.getProductAll)
router.get("/:id", auth, artwork.getProductById)
router.put("/:id", authAdmin, artwork.updateProduct)
router.delete("/:id", authAdmin, artwork.deleteProduct)

// Price
router.post("/price", authAdmin, price.create)
router.get("/price/all", auth, price.getPriceAll)
router.get("/price/:id", auth, price.getPriceById)
router.get("/price/product/:id", auth, price.getPriceByProductId)
router.put("/price/:id", authAdmin, price.updatePrice)
router.delete("/price/:id", authAdmin, price.deletePrice)

module.exports = router;