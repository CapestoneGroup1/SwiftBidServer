import express from "express"
import { ProductController } from "../controllers/ProductController"

const router = express.Router()

router.post("/add", ProductController.addProduct)

router.post("/update", ProductController.updateProduct)


export const productRoutes = router
