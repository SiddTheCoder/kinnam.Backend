import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
})

export const Cart = mongoose.model('Cart',cartSchema)