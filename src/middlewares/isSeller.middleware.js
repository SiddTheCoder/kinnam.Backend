import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const isSeller = asyncHandler(async (req, _, next) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(404, 'User Not Found');
  }

  const sellerId = req.cookies?.sellerId || req.header('sellerId');
  if (!sellerId) {
    throw new ApiError(400, 'Seller ID is required');
  }

  if(user.sellerId !== sellerId) {
    throw new ApiError(403, 'Unauthorized Seller Token');
  }

  next()
})

export { isSeller }