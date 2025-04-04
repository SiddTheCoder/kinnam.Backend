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
      required: true
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: {
        type: Number,
        required: true
      },
      discount: {
        type: Number,
        default: 0
      },
      totalPrice: {
        type: Number,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
})

export const Cart = mongoose.model('Cart',cartSchema)