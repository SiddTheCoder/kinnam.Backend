import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique : true
  },
  details: {
    type: String,
    default : 'Our Best Product Ever'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'Category'
  },
  specifications: {
    type: Array,
    default : null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  price: {
    type: Number,
    required : true
  },
  stock: {
    type: Number,
    default : 1
  },
  discount: {
    type: Number,
    default : 0
  },
  productImage: {
    type: String,
    required : true
  },
  brand: {
    type: String,
    required : true
  },
  feedbacks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedBack'
    }
  ],
  rating: {
    type: Number,
    default : 0
  },
  
  ratedData: [],
  
  warrantyAvailable: {
    type: Boolean,
    default : true
  },
  returnBackDays: {
    type: Number,
    default : 14
  }
  
  },{ timestamps: true })

export const Product = mongoose.model('Product', productSchema)

