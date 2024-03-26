import { NextFunction, Response } from "express"
import { AddNewCreditCard, CustomRequest, User } from "../types"
import { getUserFromEmail, getUserProfile, saveUserProfile } from "../services/UserServices"
import { BadRequest, InternalServerError } from "../utils/exceptions"
import { WinnerModel } from "../models/winners"
import { UserModel } from "../models/user"
import {
  addNewCardForCustomer,
  createCustomer,
  getCustomerSavedCards,
} from "../services/StripeService"
import { getProductBids, getProductBidsOnly } from "../services/ProductService"
import { BidModel } from "../models/bid"

export class UserController {
  /**
   * This is to get profile for loggedIN users
   * This will return user details based on the userId, which was there in token and appended to req object through previous middleware.
   * @param req
   * @param res
   * @param next
   * @returns
   */
  static async getUserProfile(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { userId = "" } = req
      const userDetails = await getUserProfile(userId)
      if (!userDetails) {
        throw new BadRequest("User doesnt Exist")
      }
      const { username, email, mobile, address, province, city, postalcode, role, country } =
        userDetails

      return res.json({
        username,
        email,
        mobile,
        address,
        province,
        city,
        postalcode,
        id: userDetails._id,
        role,
        country,
        primaryCard: userDetails.primaryCard,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * This is t get profile for Other users for admin purpose...
   * @param req
   * @param res
   * @param next
   * @returns
   */
  static async getUserProfileFromPath(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userDetails = await getUserProfile(id)
      if (!userDetails) {
        throw new BadRequest("User doesnt Exist")
      }
      const { username, email, mobile, address, province, city, postalcode } = userDetails

      return res.json({ username, email, mobile, address, province, city, postalcode })
    } catch (error) {
      next(error)
    }
  }

  static async saveUserProfile(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) throw new BadRequest("User doesnt Exist")

      const body = req.body as User
      const { email, mobile, address, province, city, postalcode, country } = body

      //DO EMial unique check...
      if (email) {
        const userFromDB = await getUserProfile(req.userId)
        if (userFromDB?.email !== email) {
          const existingUser = await getUserFromEmail(email)
          if (existingUser) {
            throw new BadRequest("Email already Exists")
          }
        }
      }

      const savedUser = await saveUserProfile(
        { email, mobile, address, province, city, postalcode, country },
        req.userId,
      )
      if (!savedUser) {
        throw new Error("Internal Error")
      }

      //Update.
      return res.json({
        email: savedUser.email,
        mobile: savedUser.mobile,
        address: savedUser.address,
        province: savedUser.province,
        city: savedUser.city,
        postalcode: savedUser.postalcode,
        username: savedUser.postalcode,
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  static async getUserWinnings(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { userId = "" } = req
      const winnings = await WinnerModel.find({
        userid: userId,
      }).populate("productid")

      return res.json(winnings)
    } catch (error) {
      next(error)
    }
  }

  static async getUserWishlist(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { userId = "" } = req
      const data = await UserModel.findById(userId).populate("wishlist")
      return res.json(data?.wishlist || [])
    } catch (error) {
      next(error)
    }
  }

  static async addNewCardForUser(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { userId, body } = req

      const userDetails = await UserModel.findById(userId)
      if (!userDetails) {
        throw new BadRequest("User Not Found")
      }

      let stripeCustomerId = userDetails.stripeCustomerId
      if (!stripeCustomerId) {
        const customer = await createCustomer(userDetails.email)
        if (customer) {
          stripeCustomerId = customer.id
        }
      }

      if (!stripeCustomerId) {
        throw new InternalServerError("Failed To Save Card Details.")
      }

      const {
        name,
        address_country,
        address_zip,
        cvc,
        exp_month,
        exp_year,
        number,
        testCardToken,
      } = body as AddNewCreditCard

      const card = await addNewCardForCustomer(
        { name, address_country, address_zip, cvc, exp_month, exp_year, number, testCardToken },
        stripeCustomerId,
      )
      if (!card.id) {
        throw new InternalServerError("Failed to create new card")
      }

      userDetails.stripeCustomerId = stripeCustomerId
      userDetails.savedCards.push(card.id)
      if (!userDetails.primaryCard) {
        userDetails.primaryCard = card.id
      }

      await userDetails.save()

      return res.json({
        cardId: card.id,
        number: card.last4,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        name: card.name,
        brand: card.brand,
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  static async userCards(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req

      const userDetails = await UserModel.findById(userId)
      if (!userDetails) {
        throw new BadRequest("User Not Found")
      }

      let stripeCustomerId = userDetails.stripeCustomerId
      if (!stripeCustomerId) {
        return res.json([])
      }

      const allcards = await getCustomerSavedCards(stripeCustomerId)
      const cardsArray = allcards
        ?.filter((obj) => userDetails?.savedCards?.includes(obj.id))
        .map((card) => {
          return {
            cardId: card.id,
            number: card.last4,
            exp_month: card.exp_month,
            exp_year: card.exp_year,
            name: card.name,
            brand: card.brand,
          }
        })
      return res.json(cardsArray || [])
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  static async changePrimaryCard(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req
      const { cardId } = req.params

      const userDetails = await UserModel.findById(userId)
      if (!userDetails) {
        throw new BadRequest("User Not Found")
      }

      const cardExists = userDetails.savedCards.includes(cardId)
      if (!cardExists) {
        throw new BadRequest("Card Not Found in User's Saved Cards")
      }

      await UserModel.findByIdAndUpdate(userId, { $set: { primaryCard: cardId } })

      return res.json({ cardId, message: "Primary Card Updated Successfully" })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  static async deleteCard(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req
      const { cardId } = req.params

      const userDetails = await UserModel.findById(userId)
      if (!userDetails) {
        throw new BadRequest("User Not Found")
      }

      let topBids = [] as any
      /**
       * If user is the top bidder for any product , for which bidding is ongoing then we should not all to delete Primary card
       *
       */
      if (userDetails.wishlist?.length > 0 && userDetails.primaryCard === cardId) {
        for (let i = 0; i < userDetails.wishlist.length; i++) {
          const productid = userDetails.wishlist[i].toString()
          const productBids = await getProductBidsOnly(productid)
          if (productBids?.length > 0) {
            const higestBid = productBids[0]
            if (higestBid?.userid.toString() === userDetails._id.toString()) {
              const productWinnerDetails = await WinnerModel.findOne({ productid })
              if (
                !productWinnerDetails ||
                (`${productWinnerDetails?.userid}` === `${userDetails._id}` &&
                  !productWinnerDetails?.paymentcompleted)
              ) {
                topBids.push({
                  productid,
                })
              }
            }
          }
        }
      }

      if (topBids?.length > 0) {
        throw new BadRequest(
          "Unable to delete primary card. Please designate another card as primary before removing this one, as you are currently the top bidder for certain products.",
        )
      }

      const cardExists = userDetails.savedCards.includes(cardId)
      if (!cardExists) {
        throw new BadRequest("Card Not Found in User's Saved Cards")
      }

      userDetails.savedCards = userDetails.savedCards?.filter((id) => id !== cardId)

      if (userDetails.primaryCard === cardId) {
        userDetails.primaryCard = ""
      }

      await userDetails.save()

      return res.json({ cardId, message: "Card Deleted Successfully" })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}