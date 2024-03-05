import { NextFunction, Request, Response } from "express"
import { CategoryModel } from "../models/category"
import { BadRequest, NotFound } from "../utils/exceptions"
import { AddCategoryRequest } from "../types";
export class CategoryController {
  static async addCategory(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract product data from the request body
      const { name } = req.body || {} as AddCategoryRequest;
      if (!name) {
        throw new BadRequest("Invalid Category Name")
      }

      const existingCategory = await CategoryModel.findOne({ name })
      if(existingCategory?._id) {
        throw new BadRequest("Category Already Exists")
      }

      // Create a new category instance
      const newCategory = new CategoryModel({ name })
      const savedCategory = await newCategory.save()
      res.status(201).json({
        id: savedCategory._id,
        name: savedCategory.name,
      })
    } catch (error) {
      console.log(error);
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
}
