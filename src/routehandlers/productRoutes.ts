import express from "express"
import { ProductController } from "../controllers/ProductController"
import { upload } from "../config/MulterConfig"
import { validateSchema, validateToken } from "../middlewares/authMiddlewares"
import { AddProductSchema } from "../utils/schemas"
const router = express.Router()

router.get("/", validateToken, ProductController.getAllProducts)
router.get("/details/:productid", validateToken, ProductController.getProductDetailsById)
router.post("/add", validateToken, upload.single("file"), validateSchema(AddProductSchema), ProductController.addProduct)
router.post("/update", validateToken, upload.single("file"), validateSchema(AddProductSchema), ProductController.updateProduct)
router.get("/userId", validateToken, ProductController.getProductByUserId)

export const productRoutes = router