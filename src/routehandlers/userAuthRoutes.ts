import express from "express"
import { AuthController } from "../controllers/AuthController"
import { isUserEmailExists, validateSchema } from "../middlewares/authMiddlewares"
import {
  ForgotPasswordSchema,
  LoginSchema,
  ResetPasswordSchema,
  SignUpSchema,
} from "../utils/schemas"

const router = express.Router()

router.post("/login", validateSchema(LoginSchema), AuthController.login)
router.post("/signup", validateSchema(SignUpSchema), AuthController.signup)
router.post(
  "/forgotpassword",
  validateSchema(ForgotPasswordSchema),
  isUserEmailExists,
  AuthController.forgotPassword,
)
router.post("/resetpassword", validateSchema(ResetPasswordSchema), AuthController.resetPassword)
router.post("/google", AuthController.googleAccountLink)

export const userAuthRoutes = router
