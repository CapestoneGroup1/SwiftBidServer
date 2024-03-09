import mongoose from "mongoose"
import { BidModel } from "../models/bid"
import { UserModel } from "../models/user"
import { User } from "../types"

export const getUserProfile = async (id: string) => {
  return await UserModel.findById(id)
}

export const getUserFromEmail = async (email: string) => {
  return await UserModel.findOne({
    email,
  })
}

export const saveUserProfile = async (user: Partial<User>, id: string) => {
  console.log(user)
  console.log(id)

  return await UserModel.findByIdAndUpdate(id, {
    ...user,
  })
}

export const getUserPlacedBids = async (userid: string) => {
  try {
    const bids = await BidModel.aggregate([
      { $match: { userid: new mongoose.Types.ObjectId(userid) } },
      {
        $group: {
          _id: "$productid",
          bids: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "Products",
          localField: "productid",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 0,
          product: 1,
          bids: 1,
        },
      },
    ])

    return bids
  } catch (error) {
    console.error("Error retrieving bids:", error)
    throw error
  }
}
