import express from "express"
import { CategoryController } from "../controllers/CategoryController"
import { isUserAdmin, validateToken } from "../middlewares/authMiddlewares"

const router = express.Router()
router.get("/", CategoryController.getAllCategories)
router.post("/add", validateToken, isUserAdmin, CategoryController.addCategory)
router.post("/edit", validateToken, isUserAdmin, CategoryController.editCategory)
router.post("/delete", validateToken, isUserAdmin, CategoryController.deleteCategory)

export const categoryRoutes = router