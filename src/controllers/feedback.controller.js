import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { FeedBack } from '../models/feedBack.model.js'
import { Product } from '../models/product.model.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'


const addFeedBack = asyncHandler(async (req, res) => {
  const {productId} = req.params
  const {text} = req.body
  const userId = req.user?._id
  if (!text) {
    throw new ApiError(400, 'Feedback text is required')
  }

  const photosLocalPath = req.files?.photos?.map((photo) => photo.path)
  if (!photosLocalPath) {
    throw new ApiError(400, 'Photos are required')
  }
  if (!productId) {
    throw new ApiError(400, 'Product ID is required')
  }

  let cloudnaryPhotosUrls = []
  // Check if the product exists
  if (photosLocalPath && photosLocalPath.length > 0) {
    // Upload photos to Cloudinary
    cloudnaryPhotosUrls = await Promise.all(
      photosLocalPath.map(async (photo) => {
        const result = await uploadOnCloudinary(photo, 'feedbacks')
        return result?.url
      })
    )

  }

  const feedback = await FeedBack.create({
    text,
    productId,
    photos : cloudnaryPhotosUrls,
    feedbacker: userId
  })

  if (!feedback) {
    throw new ApiError(500, 'Error occurred while creating feedback')
  }

  const product = await Product.findById(productId)
  if (!product) {
    throw new ApiError(404, 'Product not found')
  }
  product.feedbacks.push(feedback._id)
  await product.save()

  return res
    .status(201)
    .json(new ApiResponse(
    201,
    feedback,
    'Feedback Created Successfully'
  ))

 })

const getAllFeedBacks = asyncHandler(async (req, res) => {
    
  const { productId } = req.params

  if (!productId) {
    throw new ApiError(400, 'Product ID is required')
  }

  const feedbacks = await FeedBack.find({ productId })
    .populate('feedbacker', 'name email')
    .populate('photos')
    .populate('replies')
    .sort({ createdAt: -1 })
  
  if (!feedbacks || feedbacks.length === 0) {
    throw new ApiError(404, 'No feedbacks found for this product')
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      feedbacks,
      'Feedbacks retrieved successfully'
    ))

})

const updateFeedBack = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params
  const { text } = req.body

  if (!feedbackId) {
    throw new ApiError(400, 'Feedback ID is required')
  }

  if(!text) {
    throw new ApiError(400, 'Feedback text is required')
  }

  const feedback = await FeedBack.findByIdAndUpdate(
    feedbackId,
    { text },
    { new: true }
  )

  if (!feedback) {
    throw new ApiError(404, 'Feedback not found')
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      feedback,
      'Feedback updated successfully'
    ))
})

const deleteFeedBack = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params

  if (!feedbackId) {
    throw new ApiError(400, 'Feedback ID is required')
  }

  const feedback = await FeedBack.findByIdAndDelete(feedbackId)

  if (!feedback) {
    throw new ApiError(404, 'Feedback not found')
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      feedback,
      'Feedback deleted successfully'
    ))

})




export {
  addFeedBack,
  getAllFeedBacks,
  updateFeedBack,
  deleteFeedBack,
  // addCommentToFeedBack,
  // getAllCommentsForFeedBack,
  // updateComment,
  // deleteComment
}