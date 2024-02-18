import { NextFunction, Request,Response } from "express";
import { Product } from "../types";
import {ProductSchema} from "../models/product";

function generateId() {
    const min = 1000;
      const max = 9999;
      const randomID = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomID;
}

export class ProductController{

    static async addProduct(req:Request,res:Response,next:NextFunction){
        try {
            // Extract product data from the request body
            const { name, description, price, imageurl, category, userid, status, bidenddate, adminapproval } = req.body;
            
            const id= generateId();
            // Create a new product instance based on the Product interface
            const newProduct = new ProductSchema({
                id: id.toString(),
                name,
                description,
                price,
                imageurl,
                category,
                userid,
                status,
                bidenddate,
                adminapproval
            });
            const savedProduct = await newProduct.save();
            res.status(201).json({ message: "Product added successfully", product: newProduct });
        } catch (error) {
        
            console.error("Error adding product:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    static async updateProduct(req: Request, res: Response, next: NextFunction) {
        try {
            // Extract product ID from request parameters
            const {id} = req.body;

            // Extract updated product data from the request body
            const { name, description, price, imageurl,status } = req.body;

            // Find and update the product by ID
            const updatedProduct = await ProductSchema.findOneAndUpdate(id, {
                name,
                description,
                price,
                imageurl,
                status,
            }, { new: true });

            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
