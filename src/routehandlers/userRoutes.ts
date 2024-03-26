import express from "express"
import { isUserAdmin, validateSchema, validateToken } from "../middlewares/authMiddlewares"
import { UserController } from "../controllers/UserController"
import { SaveProfileSchema } from "../utils/schemas"

const router = express.Router()

router.get("/profile", validateToken, UserController.getUserProfile)
router.get("/profile/:id", validateToken, isUserAdmin, UserController.getUserProfileFromPath)
router.post(
  "/profile",
  validateToken,
  validateSchema(SaveProfileSchema),
  UserController.saveUserProfile,
)
router.get("/winnings", validateToken, UserController.getUserWinnings)
router.get("/wishlist", validateToken, UserController.getUserWishlist)

router.post("/addnewcard", validateToken, UserController.addNewCardForUser)
router.get("/savedcards", validateToken, UserController.userCards)
router.post("/setprimarycard/:cardId", validateToken, UserController.changePrimaryCard)
router.post("/deletecard/:cardId", validateToken, UserController.deleteCard)

export const userRoutes = router