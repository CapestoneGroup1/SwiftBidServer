import { EmailConfig } from "../config/EmailConfig"
import { BidModel } from "../models/bid"
import { ProductSchema } from "../models/product"
import { WinnerModel } from "../models/winners"
import { failedPurchase, purchaseSuccess } from "../utils/mailTemplates"
import { chargeUserCard } from "./StripeService"
import { getUserProfile } from "./UserServices"

export const getProductBids = async (id: string) => {
  return await BidModel.find({ productid: id })
    .populate({
      path: "userid",
      select: "username",
    })
    .populate({
      path: "productid",
      select: "price",
    })
    .sort({
      bidprice: -1,
    })
}

export const getProductBidsOnly = async (id: string) => {
  return await BidModel.find({ productid: id }).sort({
    bidprice: -1,
  })
}

export const chargeUserForPurchase = async (
  userid: string,
  productid: string,
  price: number,
  date: any,
) => {
  const userDetails = await getUserProfile(userid.toString())
  const productDetails = await ProductSchema.findById(productid)

  try {
    if (userDetails?.primaryCard) {
      const debitAmountDetails = await chargeUserCard(
        userDetails.stripeCustomerId!,
        userDetails?.primaryCard,
        price * 100,
        userDetails.email!,
      )
      if (
        debitAmountDetails &&
        (debitAmountDetails?.status === "succeeded" || debitAmountDetails?.status === "pending")
      ) {
        await WinnerModel.create({
          userid,
          productid,
          bidprice: price,
          date,
          paymentcompleted: true,
          cardId: userDetails?.primaryCard,
          transactionId: debitAmountDetails.id,
        })

        EmailConfig.sendEmail(
          userDetails.email,
          "PAYMENT SUCCESS",
          "",
          purchaseSuccess.replace("{0}", productDetails!.name).replace("{1}", `${price} CAD`),
        )
      } else {
        throw new Error("Failed Status from Stripe")
      }
    }
  } catch (error) {
    await WinnerModel.create({
      userid,
      productid,
      bidprice: price,
      date,
      paymentcompleted: false,
    })
    EmailConfig.sendEmail(
      userDetails!.email,
      "PAYMENT FAILURE",
      "",
      failedPurchase.replace("{0}", productDetails!.name).replace("{1}", `${price} CAD`),
    )
  }
}
