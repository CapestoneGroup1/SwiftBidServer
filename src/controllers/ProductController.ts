import { NextFunction, Request, Response } from "express"
import { ProductSchema } from "../models/product"
import { ApproveRejectPRoduct, CustomRequest, Product } from "../types"
import { BadRequest } from "../utils/exceptions"
import { FirebaseService } from "../services/FirebaseService"
import { isUserRoleAdmin } from "../utils/commonUtils"
import { EmailConfig } from "../config/EmailConfig"
import { UserModel } from "../models/user"
import { approvalEmailContent, rejectionEmailContent } from "../utils/mailTemplates"

export class ProductController {
  static async addProduct(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      // Extract product data from the request body
      const { name, description, price, category, bidenddate } = req.body as Product

      const file = req?.file
      if (!file) {
        throw new BadRequest("Please upload an image")
      }

      const firebaseService = FirebaseService.initialize()
      const firebaseImageUrl = await firebaseService.saveFileToFirebase(
        file.buffer,
        `${req.userId}-${new Date().getTime()}`,
        file.mimetype,
      )

      if (!firebaseImageUrl) {
        throw new BadRequest("Failed to Upload Image Try again...")
      }

      const newProduct = new ProductSchema({
        name,
        description,
        price,
        imageurl: firebaseImageUrl,
        category,
        userid: req.userId, // from auth token
        bidenddate,
        adminapproval: isUserRoleAdmin(req.user?.role || "") ? "APPROVED" : "PENDING",
      })
      const savedProduct = await newProduct.save()
      res.status(201).json({ ...savedProduct.toJSON() })
    } catch (error) {
      next(error)
    }
  }

  static async updateProduct(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      // Extract updated product data from the request body
      const { name, description, price, id, category } = req.body as Product
      const existingProduct = await ProductSchema.findById(id)
      if (!existingProduct?._id) {
        throw new BadRequest("Invalid Product Id")
      }

      //TODO stop updating the product if there are any ongoing bids on the product.. handled in next sprint.

      const file = req.file
      let imageUrl
      if (file) {
        const firebaseService = FirebaseService.initialize()
        imageUrl = await firebaseService.saveFileToFirebase(
          file.buffer,
          `${req.userId}-${new Date().getTime()}`,
          file.mimetype,
        )
      }

      // Find and update the product by ID
      const updatedProduct = await ProductSchema.findByIdAndUpdate(
        id,
        {
          name,
          description,
          price,
          category,
          imageUrl: imageUrl,
          adminapproval: isUserRoleAdmin(req.user?.role || "") ? "APPROVED" : "PENDING",
        },
        { new: true },
      )

      if (!updatedProduct) {
        throw new BadRequest("failed to Update Product Details")
      }

      res.status(200).json({ ...updatedProduct.toJSON() })
    } catch (error) {
      next(error)
    }
  }

  static async getPendingApprovalProducts(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const data = await ProductSchema.find({
        adminapproval: "PENDING",
      })
      res.status(200).json(data)
    } catch (error) {
      next(error)
    }
  }

  static async approveProduct(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.body as ApproveRejectPRoduct
      const updatedProduct = await ProductSchema.findByIdAndUpdate(
        id,
        {
          adminapproval: "APPROVED",
        },
        { new: true },
      )
      if (updatedProduct) {
        const { userid } = updatedProduct
        const user = await UserModel.findById(userid)
        if (user) {
          EmailConfig.sendEmail(
            user.email,
            "PRODUCT APPROVED FOR SELLING",
            "",
            approvalEmailContent.replace("{0}", updatedProduct.name),
          )
        }
      }
      res.status(200).json({ ...updatedProduct?.toJSON() })
    } catch (error) {
      next(error)
    }
  }

  static async rejectProduct(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { id, rejectReason } = req.body as ApproveRejectPRoduct
      if (!rejectReason) {
        throw new BadRequest("Product Rejection reason missing")
      }
      const updatedProduct = await ProductSchema.findByIdAndUpdate(
        id,
        {
          adminapproval: "REJECTED",
        },
        { new: true },
      )
      if (updatedProduct) {
        const { userid } = updatedProduct
        const user = await UserModel.findById(userid)
        if (user) {
          EmailConfig.sendEmail(
            user.email,
            "PRODUCT REJECTED FOR SELLING",
            "",
            rejectionEmailContent
              .replace("{0}", updatedProduct.name)
              .replace("{reason}", rejectReason),
          )
        }
      }
      res.status(200).json({ ...updatedProduct?.toJSON() })
    } catch (error) {
      next(error)
    }
  }
}
