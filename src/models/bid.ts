import mongoose from "mongoose"
const Schema = mongoose.Schema

export const bidSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "swiftbiduser",
    required: true,
  },
  productid: {
    type: Schema.Types.ObjectId,
    ref: "Products",
    required: true,
  },
  bidprice: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  won: {
    type: Boolean,
  },
})

export const BidModel = mongoose.model("Bid", bidSchema)
