import { NextFunction, Request, Response } from "express"
import { CategoryModel } from "../models/category"
import { BadRequest, NotFound } from "../utils/exceptions"
import { AddCategoryRequest, CustomRequest, EditCategoryRequest } from "../types"
export class CategoryController {
  static async addCategory(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      // Extract product data from the request body
      const { name } = req.body || ({} as AddCategoryRequest)
      if (!name) {
        throw new BadRequest("Invalid Category Name")
      }

      const existingCategory = await CategoryModel.findOne({ name })
      if (existingCategory?._id) {
        throw new BadRequest("Category Already Exists")
      }

      // Create a new category instance
      const newCategory = new CategoryModel({ name })
      const savedCategory = await newCategory.save()
      res.status(201).json(savedCategory.toJSON())
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  static async editCategory(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { name, id } = req.body as EditCategoryRequest
      if (!name || !id) {
        throw new BadRequest("Invalid Category Id/Name")
      }

      const details = await CategoryModel.findByIdAndUpdate(
        id,
        {
          name: name,
        },
        { new: true },
      )

      if (!details) {
        throw new BadRequest("Invalid Category Id/Name")
      }

      res.status(201).json(details.toJSON())
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract category ID from the request body
      const { id } = req.body

      // Find the category by ID
      const categoryToDelete = await CategoryModel.findById(id)

      if (!categoryToDelete) {
        throw new NotFound("Category not found")
      }

      // Delete the category
      await CategoryModel.deleteOne({ id })

      res.status(200).json({ message: "Category deleted successfully", category: categoryToDelete })
    } catch (error) {
      next(error)
    }
  }

  static async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryModel.find({})
      res.status(200).json(data)
    } catch (error) {
      next(error)
    }
  }
}
