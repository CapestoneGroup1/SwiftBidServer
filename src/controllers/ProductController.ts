import { NextFunction, Request, Response } from "express"
import { ProductSchema } from "../models/product"
import { ApproveRejectPRoduct, CustomRequest, Product } from "../types"
import { BadRequest, InternalServerError, NotFound } from "../utils/exceptions"
import { FirebaseService } from "../services/FirebaseService"
import { isFileAcceptable, isUserRoleAdmin } from "../utils/commonUtils"
import { EmailConfig } from "../config/EmailConfig"
import { UserModel } from "../models/user"
import { approvalEmailContent, rejectionEmailContent } from "../utils/mailTemplates"
import { getProductBids } from "../services/ProductService"
import { WinnerModel } from "../models/winners"

export class ProductController {
  
  static async getAllProducts(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const filter = {
        adminapproval: {
          $in: ["APPROVED", "BIDDING"],
        },
        bidenddate: { $gt: new Date().getTime().toString() },
      } as any

      const { category, limit } = req.query
      if (category) {
        filter.category = category
      }

      const query = ProductSchema.find(filter)

      if (limit) {
        query.limit(parseInt(limit as string, 10))
      }

      const products = await query.exec()
      res.status(200).json(products)
    } catch (error) {
      throw new InternalServerError("An unexpected error occurred.")
    }
  }

  static async getProductDetailsById(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { productid } = req.params
      const product = await ProductSchema.findById(productid)
      if (!product) {
        throw new BadRequest("Product Details not found")
      }
      res.status(200).json(product.toJSON())
    } catch (error) {
      next(error)
    }
  }

  static async getProductByUserId(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId

      // Find all products belonging to the specified user
      const products = await ProductSchema.find({ userid: userId })

      res.status(200).json(products || [])
    } catch (error) {
      throw new InternalServerError("An unexpected error occurred.")
    }
  }
  static async addProduct(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      // Extract product data from the request body
      const { name, description, price, category, bidenddate } = req.body as Product

      const file = req?.file
      if (!file) {
        throw new BadRequest("Please upload an image")
      }

      console.log(file.mimetype?.split("/")[1])
      const isValidExtension = isFileAcceptable(file.mimetype?.split("/")[1])
      if (!isValidExtension) {
        throw new BadRequest("We accept only jpg, jpeg, png file type")
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

      if (existingProduct.userid.toString() !== req.userId) {
        throw new BadRequest("Access denied to update other users produts")
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
        const isValidExtension = isFileAcceptable(file.mimetype?.split("/")[1])
        if (!isValidExtension) {
          throw new BadRequest("We accept only jpg, jpeg, png file type")
        }
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
        .populate({
          path: "userid",
          select: "-password -otp", // Exclude password and otp fields
        })
        .populate("category")
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

  /**
   * Returns products whose bid end date is reached and winners are yet to be declared...
   * @param req
   * @param res
   * @param next
   */
  static async getBidEndProducts(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { timestamp } = req.params
      if (!timestamp) {
        throw new BadRequest("Timestamp not provided")
      }

      const results = []

      const products = await ProductSchema.find({
        adminapproval: {
          $in: ["APPROVED"],
        },
        bidenddate: timestamp,
      }).populate("userid")
      for (let i = 0; i < products.length; i++) {
        const bids = await getProductBids(products[i]["_id"].toString())
        results.push({
          product: products[i],
          bids,
        })
      }

      res.status(200).json(results)
    } catch (error) {
      next(error)
    }
  }

  /**
   * For the productids sent in body, it changes the status to stop bidding anf declare winners
   * @param req
   * @param res
   * @param next
   */
  static async stopBiddingAndDEclareWinners(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { timestamp } = req.params
      if (!timestamp) {
        throw new BadRequest("Timestamp not provided")
      }

      const products = await ProductSchema.find({
        adminapproval: {
          $in: ["APPROVED"],
        },
        bidenddate: timestamp,
      })

      for (let i = 0; i < products.length; i++) {
        const { _id } = products[i]
        const bids = await getProductBids(products[i]["_id"].toString())
        await ProductSchema.findByIdAndUpdate(_id, {
          adminapproval: bids?.length > 0 ? "SOLD" : "EXPIRED",
        })
        if (bids.length > 0) {
          const winningBid = bids[0]
          await WinnerModel.create({
            userid: winningBid.userid,
            productid: _id,
            bidprice: winningBid.bidprice,
            date: winningBid.date,
          })
        }
      }

      res.status(200).json({})
    } catch (error) {
      next(error)
    }
  }
}
