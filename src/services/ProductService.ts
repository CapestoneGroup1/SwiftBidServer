import { BidModel } from "../models/bid"

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
