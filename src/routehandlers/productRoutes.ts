import express from "express"
import { ProductController } from "../controllers/ProductController"
import { upload } from "../config/MulterConfig"
import { isUserAdmin, validateToken } from "../middlewares/authMiddlewares"
const router = express.Router()

router.post("/add", validateToken, upload.single("file"), ProductController.addProduct)
router.post("/update", validateToken, upload.single("file"), ProductController.updateProduct)
router.get(
  "/pendingapproval",
  validateToken,
  isUserAdmin,
  ProductController.getPendingApprovalProducts,
)
router.post("/approveproduct", validateToken, isUserAdmin, ProductController.approveProduct)
router.post("/rejectproduct", validateToken, isUserAdmin, ProductController.rejectProduct)

export const productRoutes = router
