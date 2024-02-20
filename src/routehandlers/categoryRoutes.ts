import express from "express"
import { CategoryController } from "../controllers/CategoryController"
import { isUserAdmin, validateToken } from "../middlewares/authMiddlewares"

const router = express.Router()

router.post("/add", validateToken, isUserAdmin, CategoryController.addCategory)

router.post("/delete", validateToken, isUserAdmin, CategoryController.deleteCategory)

export const categoryRoutes = router