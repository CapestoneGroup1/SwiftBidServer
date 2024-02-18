import { NextFunction, Request,Response } from "express";
import {CategoryModel} from "../models/category";
export class CategoryController{


    static async addCategory(req:Request,res:Response,next:NextFunction){
        try {
            // Extract product data from the request body
            const { name } = req.body;
            
            const uniqueId = generateId();
       
            // Create a new category instance
            const newCategory = new CategoryModel({ id: uniqueId, name });

            const savedCategory = await newCategory.save();
            res.status(201).json({ message: "Category added successfully", Category: newCategory });
        } catch (error) {
        
            console.error("Error adding category:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    static async deleteCategory(req: Request, res: Response, next: NextFunction) {
        try {
            // Extract category ID from the request body
            const { id } = req.body;

            // Find the category by ID
            const categoryToDelete = await CategoryModel.findOne({ id });

            if (!categoryToDelete) {
                return res.status(404).json({ message: "Category not found" });
            }

            // Delete the category
            await CategoryModel.deleteOne({ id });

            res.status(200).json({ message: "Category deleted successfully", category: categoryToDelete });
        } catch (error) {
            console.error("Error deleting category:", error);
            res.status(500).json({ message: "Internal server error" });
        }
       
    }

}


    function generateId() {
        const min = 1000;
          const max = 9999;
          const randomID = Math.floor(Math.random() * (max - min + 1)) + min;
          return randomID;
    }

