import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Comment } from '../models/comment.model.js'
import { FeedBack } from '../models/feedBack.model.js'


const addComment = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params
  const { text } = req.body
  const userId = req.user?._id

  if (!text) {
    throw new ApiError(400, 'Comment text is required')
  }

  if (!feedbackId) {
    throw new ApiError(400, 'Feedback ID is required')
  }

  const comment = await Comment.create({
    text,
    parentComment: feedbackId,
    commenter: userId
  })

  if (!comment) {
    throw new ApiError(500, 'Error occurred while creating comment')
  }

  const feedback = await FeedBack.findById(feedbackId)
  if (!feedback) {
    throw new ApiError(404, 'Feedback not found')
  }
  

  // Add the comment ID to the feedback's replies array
  feedback.replies?.push(comment._id)
  console.log(feedback.replies)
  await feedback.save()

  return res.status(201).json(new ApiResponse(201, comment,'Comment created successfully'))

})

const getCommentsByFeedbackId = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params

  if (!feedbackId) {
    throw new ApiError(400, 'Feedback ID is required')
  }

  const comments = await Comment.find({ parentComment: feedbackId })
    .populate('commenter', 'name email')
    .populate('replies')

  return res.status(200).json(new ApiResponse(200, comments))
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { text } = req.body

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required')
  }

  if (!text) {
    throw new ApiError(400, 'Comment text is required')
  }

  const updatedComment = await Comment.findByIdAndUpdate(commentId, { text }, { new: true })

  if (!updatedComment) {
    throw new ApiError(404, 'Comment not found')
  }

  return res.status(200).json(new ApiResponse(200, updatedComment, 'Comment updated successfully'))
})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required')
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId)

  if (!deletedComment) {
    throw new ApiError(404, 'Comment not found')
  }

  return res.status(200).json(new ApiResponse(200, deletedComment, 'Comment deleted successfully'))
})

const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required')
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }

  comment.likes += 1
  await comment.save()

  return res.status(200).json(new ApiResponse(200, comment ,'Comment liked successfully'))
})

const dislikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required')
  }
  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }
  comment.dislikes += 1
  await comment.save()
  return res.status(200).json(new ApiResponse(200, comment, 'Comment disliked successfully'))
})

const addReplyToComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { text } = req.body
  const userId = req.user?._id

  if (!text) {
    throw new ApiError(400, 'Reply text is required')
  }

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required')
  }

  const reply = await Comment.create({
    text,
    parentComment: commentId,
    commenter: userId
  })

  if (!reply) {
    throw new ApiError(500, 'Error occurred while creating reply')
  }

  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }

  console.log('Comment',comment)
  const feedBack = await FeedBack.findById(comment?.parentComment.toString())
  
  if (!feedBack) {
    throw new ApiError(404, 'Feedback not found')
  }
  
  comment.replies.push(reply._id)
  feedBack.replies.push(comment?._id)
  await feedBack.save()
  await comment.save()

  return res.status(201).json(new ApiResponse(201, reply, 'Reply created successfully'))
 })

const getRepliesToComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required')
  }
  const replies = await Comment.find({ parentComment: commentId })
    .populate('commenter', 'name email')
    .populate('replies')
  
  if (!replies || replies.length === 0) {
    throw new ApiError(404, 'No replies found for this comment')
  }
  
  return res.status(200).json(new ApiResponse(200, replies, 'Replies retrieved successfully'))
 })

export {
  addComment,
  getCommentsByFeedbackId,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
  addReplyToComment,
  getRepliesToComment
}