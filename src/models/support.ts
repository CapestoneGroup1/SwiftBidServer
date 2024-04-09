import mongoose from "mongoose"
var Schema = mongoose.Schema

var supportSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  message: {
    type: String,
  },
  date: {
    type: String,
  },
})

export const SupportModel = mongoose.model("support", supportSchema)
