import express from "express"
import { ProductController } from "../controllers/ProductController"
import multer from "multer";


const upload = multer({storage: multer.memoryStorage()})
const router = express.Router()
router.post("/add", upload.single("file"),ProductController.addProduct)

router.post("/update", ProductController.updateProduct)


export const productRoutes = router
