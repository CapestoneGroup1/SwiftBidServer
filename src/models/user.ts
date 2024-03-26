import mongoose from "mongoose"
var Schema = mongoose.Schema

var userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    default: "regular",
  },
  password: {
    type: String,
    required: true,
  },
  province: {
    type: String,
  },
  city: {
    type: String,
  },
  postalcode: {
    type: String,
  },
  country: {
    type: String,
  },
  otp: {
    type: String,
  },
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Products",
    },
  ],
  bids: [
    {
      type: Schema.Types.ObjectId,
      ref: "Bid",
    },
  ],
  stripeCustomerId: {
    type: String,
    required:false
  },
  savedCards: [
    {
      type: String, // Array of CardIds
      required:false
    },
  ],
  primaryCard: {
    type: String,
    required:false
  },
})

export const UserModel = mongoose.model("swiftbiduser", userSchema)