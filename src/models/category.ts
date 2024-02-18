var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CategorySchema = new Schema({
  id:{
    type: String,
    unique:true,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});
export const CategoryModel = mongoose.model("category", CategorySchema)
