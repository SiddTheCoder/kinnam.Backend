import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  feedbacker: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'Owner'
    }
  ],
  photos: {
    type: String,
    default: null
  }
  
  },{ timestamps: true })

export const FeedBack = mongoose.model('FeedBack',feedbackSchema)