import express from "express"
import { ProductController } from "../controllers/ProductController"
import { upload } from "../config/MulterConfig"
import { validateToken } from "../middlewares/authMiddlewares"
const router = express.Router()

router.get("/", validateToken, ProductController.getAllProducts)
router.post("/add", validateToken, upload.single("file"), ProductController.addProduct)
router.post("/update", validateToken, upload.single("file"), ProductController.updateProduct)
router.get("/userId", validateToken, ProductController.getProductByUserId)

export const productRoutes = router
