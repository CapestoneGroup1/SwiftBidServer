import { NextFunction, Request,Response } from "express";
import { Product } from "../types";
import {ProductSchema} from "../models/product";
import multer from 'multer';
import { initializeApp } from "firebase/app";
import {getStorage,ref,getDownloadURL,uploadBytesResumable} from 'firebase/storage'
import { firebaseConfig } from '../config/firebase';

let storage: any;

export async function FirebaseInitialize() {
    // Check if Firebase app is already initialized
    if (!storage) {
        // Initialize Firebase app asynchronously
        const app = initializeApp(firebaseConfig);
        storage = getStorage(app);
    }
}

export class ProductController {

    static async addProduct(req: Request, res: Response, next: NextFunction) {
        try {
            // Ensure Firebase is initialized
            await FirebaseInitialize();

            // Extract product data from the request body
            const { name, description, price, category, userid, status, bidenddate, adminapproval } = req.body;

            // Get the file from the request
            const file = req.file;
            console.log(name,file);
            if (!file) {
                return res.status(400).json({ message: "Please upload an image" });
            }

            // Use the initialized storage
            const storageRef = ref(storage, file.originalname);

            // Upload image to Firebase Storage
            const uploadTask = uploadBytesResumable(storageRef, file.buffer);
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Handle progress
                },
                (error) => {
                    console.error("Error uploading image:", error);
                    res.status(500).json({ message: "Failed to upload image" });
                },
                () => {
                    // Upload completed successfully, get download URL
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        // Create a new product instance
                        const newProduct = new ProductSchema({
                            id: generateId(),
                            name,
                            description,
                            price,
                            imageurl: downloadURL,
                            category,
                            userid,
                            status,
                            bidenddate,
                            adminapproval
                        });
                        // Save product to MongoDB
                        const savedProduct = await newProduct.save();
                        res.status(201).json({ message: "Product added successfully", product: newProduct });
                    }).catch((error) => {
                        console.error("Error getting download URL:", error);
                        res.status(500).json({ message: "Failed to get image URL" });
                    });
                }
            );

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
function generateId() {
    const min = 1000;
      const max = 9999;
      const randomID = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomID;
}