import mongoose from "mongoose"
var Schema = mongoose.Schema

var products = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageurl: {
    type: String,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "category",
  },
  userid: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "swiftbiduser",
  },
  bidenddate: {
    type: Date,
  },
  adminapproval: {
    type: String, // PENDING / APPROVED / REJECTED / BIDDING / SOLD
  },
  bids: [
    {
      type: Schema.Types.ObjectId,
      ref: "Bid",
    },
  ],
})
export const ProductSchema = mongoose.model("Products", products)
