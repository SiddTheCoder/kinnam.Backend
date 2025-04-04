import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique : true
  },
  owner: {
     type: mongoose.Schema.Types.ObjectId,
    ref : 'User' 
  },
  products: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'Product'
    }
  ]
  
  },{ timestamps: true })

export const Category = mongoose.model('Category',categorySchema)