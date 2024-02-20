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
    type: String,
    required: true,
  },
  imageurl: {
    type: String,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userid: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: Boolean,
  },
  bidenddate: {
    type: Date,
  },
  adminapproval: {
    type: Boolean,
  },
})
export const ProductSchema = mongoose.model("Products", products)
