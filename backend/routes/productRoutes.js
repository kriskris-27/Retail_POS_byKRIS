const express= require("express")
const router = express.Router()
const { listProducts, createProduct, updateProduct, deleteProduct }=require("../controllers/productCont")
const {protect ,adminOnly} = require("../middleware/authMiddleware")

router.get("/", listProducts)

router.post("/",createProduct )

router.put("/:id",updateProduct)

router.delete("/:id",protect,adminOnly,deleteProduct)

module.exports=router;