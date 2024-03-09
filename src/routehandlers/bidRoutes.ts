import express from "express"
import { isUserNotAdmin, validateToken } from "../middlewares/authMiddlewares"
import { BidController } from "../controllers/bidsController"

const router = express.Router()

router.get("/", validateToken, BidController.getProductBids)
router.post("/", validateToken, isUserNotAdmin, BidController.placeNewBidForProduct)
router.get("/product/:productid", validateToken, BidController.getProductBids)

export const bidRoutes = router
