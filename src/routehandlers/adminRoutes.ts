import express from "express"
import { isUserAdmin, isUserNotAdmin, validateToken } from "../middlewares/authMiddlewares"
import { ProductController } from "../controllers/ProductController"
import { upload } from "../config/MulterConfig"

const router = express.Router()

router.post("/product/approveproduct", validateToken, isUserAdmin, ProductController.approveProduct)
router.post("/product/rejectproduct", validateToken, isUserAdmin, ProductController.rejectProduct)
router.get(
  "/product/pendingapproval",
  validateToken,
  isUserAdmin,
  ProductController.getPendingApprovalProducts,
)
router.post(
  "/product/add",
  validateToken,
  isUserAdmin,
  upload.single("file"),
  ProductController.addProduct,
)
router.post(
  "/product/update",
  validateToken,
  isUserAdmin,
  upload.single("file"),
  ProductController.updateProduct,
)
router.get("/product/bidend/:timestamp", validateToken, isUserAdmin, ProductController.getBidEndProducts)
router.get("/product/declarewinners/:timestamp", validateToken, isUserAdmin, ProductController.stopBiddingAndDEclareWinners)

export const adminRoutes = router
