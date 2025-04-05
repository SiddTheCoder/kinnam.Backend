import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  feedbacker: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'User'
    }
  ],
  photos: [
    {
      type: String,
      default: null
    }
  ],
  likes: {
    type: Number,
    default : 0
  },
  dislikes: {
    type: Number,
    default : 0
  },
  replies: [
    {
    type: Schema.Types.ObjectId,
    ref:'Comment'
    }
  ]
  
  },{ timestamps: true })

export const FeedBack = mongoose.model('FeedBack',feedbackSchema)