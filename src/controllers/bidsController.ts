import { NextFunction, Response } from "express"
import { CustomRequest, PlaceNewBid } from "../types"
import { BadRequest } from "../utils/exceptions"
import { BidModel } from "../models/bid"
import { ProductSchema } from "../models/product"
import { getProductBids } from "../services/ProductService"

export class BidController {
  /**
   * To place new Bid for a product
   * @param req
   * @param res
   * @param next
   * @returns
   */
  static async placeNewBidForProduct(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { bidprice, productid } = req.body as PlaceNewBid
      if (!bidprice || !productid) {
        throw new BadRequest("Details Missing productid and price")
      }

      const productDetails = await ProductSchema.findById(productid)
      if (
        !productDetails ||
        !productDetails.adminapproval ||
        ["REJECTED", "PENDING", "SOLD"].includes(productDetails.adminapproval)
      ) {
        throw new BadRequest("Product doesnt Exist / Not Approved for Selling / SOLD OUT")
      }

      if (productDetails.userid.toString() === req.user?.id) {
        throw new BadRequest("You cannot Bid on your Own Products")
      }

      if (bidprice <= productDetails.price) {
        throw new BadRequest("Bid Price Should be greater than Base Price")
      }

      const highestBid = await BidModel.find({ productid }).sort({ bidprice: -1 })
      const highestBidPrice = highestBid.length > 0 ? highestBid[0].bidprice : 0

      if (bidprice <= highestBidPrice) {
        throw new BadRequest(`Bid Amount is less than Highest Bid (${highestBidPrice})`)
      }

      const bidDetails = await BidModel.create({
        bidprice,
        productid,
        date: new Date(),
        userid: req.user?.id,
      })

      ProductSchema.findByIdAndUpdate(productid, {
        adminapproval: "BIDDING",
      })

      return res.json(bidDetails.toJSON())
    } catch (error) {
      next(error)
    }
  }

  static async getProductBids(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { productid } = req.params
      if (!productid) {
        throw new BadRequest("Details Missing productid")
      }

      const bids = await getProductBids(productid)
      res.json(bids)
    } catch (error) {
      next(error)
    }
  }

  
  static async getUserBidsProductWise(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { productid } = req.params
      if (!productid) {
        throw new BadRequest("Details Missing productid")
      }

      const bids = await getProductBids(productid)
      res.json(bids)
    } catch (error) {
      next(error)
    }
  }
}
