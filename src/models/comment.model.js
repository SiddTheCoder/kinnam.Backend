import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  text: {
    type: String,
    default : 'A sub Comment'
  },
  commenter: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'FeedBack'
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref : 'Comment'
    }
  ],
    likes: {
    type: Number,
    default : 0
  },
  dislikes: {
    type: Number,
    default: 0
  }
})

export const Comment = mongoose.model('Comment',commentSchema)