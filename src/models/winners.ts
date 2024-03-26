import mongoose from "mongoose"
const Schema = mongoose.Schema

export const winnerSchema = new Schema({
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
  paymentcompleted: {
    type: Boolean,
  },
  cardId: {
    type: String,
  },
  transactionId: {
    type: String,
  },
})

export const WinnerModel = mongoose.model("winners", winnerSchema)
