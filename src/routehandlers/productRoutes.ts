import express from "express"
import { ProductController } from "../controllers/ProductController"
import { upload } from "../config/MulterConfig"
import { validateToken } from "../middlewares/authMiddlewares"
const router = express.Router()

router.post("/add", validateToken, upload.single("file"), ProductController.addProduct)

router.post("/update", validateToken, upload.single("file"), ProductController.updateProduct)

export const productRoutes = router
