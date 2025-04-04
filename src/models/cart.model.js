import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: {
        type: Number,
      },
      discount: {
        type: Number,
        default: 0
      },
      totalPrice: {
        type: Number,
      },
      isBuyable: {
        type: Boolean,
        default: true
      },
    }
  ]
})

export const Cart = mongoose.model('Cart',cartSchema)