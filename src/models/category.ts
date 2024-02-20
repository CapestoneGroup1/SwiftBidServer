import mongoose from "mongoose"

var Schema = mongoose.Schema
var CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
})
export const CategoryModel = mongoose.model("category", CategorySchema)
