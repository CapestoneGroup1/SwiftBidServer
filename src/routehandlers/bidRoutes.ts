import express from "express"
import { isUserNotAdmin, validateSchema, validateToken } from "../middlewares/authMiddlewares"
import { BidController } from "../controllers/bidsController"
import { PlaceBidSchema } from "../utils/schemas"

const router = express.Router()

router.get("/", validateToken, BidController.getProductBids)
router.post("/", validateToken, isUserNotAdmin, validateSchema(PlaceBidSchema), BidController.placeNewBidForProduct)
router.get("/product/:productid", validateToken, BidController.getProductBids)

export const bidRoutes = router