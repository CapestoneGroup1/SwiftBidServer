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

export const userRoutes = router