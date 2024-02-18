import express from "express"
import { CategoryController } from "../controllers/CategoryController"

const router = express.Router()

router.post("/add", CategoryController.addCategory)

router.post("/delete", CategoryController.deleteCategory)


export const categoryRoutes = router
