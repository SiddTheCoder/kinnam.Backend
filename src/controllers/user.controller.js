import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import { cookieOptions, emailRegex } from '../constant.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'

const genrateRefreshAndAccessToken = async (userId) => {
 try {
   if (!userId) {
     throw new ApiError(400,'userId is required')
   }
   const user = await User.findById(userId)
   const refreshToken = user.generateRefreshToken()
   const accessToken = user.generateAccessToken()
 
   user.refreshToken = refreshToken
   await user.save({ validateBeforeSave: false })

   res.cookie('refreshToken', refreshToken, cookieOptions)
   res.cookie('accessToken', accessToken, cookieOptions)
   
   return { refreshToken, accessToken }
   
 } catch (error) {
  throw new ApiError(500 , 'Error occured while generating refresh & Access Token')
 }
}

function isValidEmailFormat(email) {
    return emailRegex.test(email);
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body
  
  if ([username, email, fullName, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required')
  }

  // Uncomment on production : ----------------------------------------------------------//
  // const isEmailFormatValid = isValidEmailFormat(email)

  // if (!isEmailFormatValid) {
  //   throw new ApiError(400,'Email Format is not Valid')
  // }

  const existedUser = await User.find({
    $or: [{ username }, { email }]
  })

  if (existedUser?.length > 0) {
    throw new ApiError(404, 'Username or Email already taken')
  }

  const user = await User.create({
    username : username.toLowerCase(),
    email: email.toLowerCase(),
    fullName,
    password
  })

  const createdUser = await User.findById(user?._id).select('-password -refreshToken')

  if (!createdUser) {
    throw new ApiError(500, 'Error Occured While Creating User')
  }

  const { accessToken, refreshToken } = await genrateRefreshAndAccessToken(createdUser?._id)

  
  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(new ApiResponse(
      200,
      createdUser,
      'User Created Successfully'
  ))

})

const loginUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body

  if (!(username || email)) throw new ApiError(400,'Email or Username is required')
  if(!password) throw new ApiError(400,'Password is required')

  const user = await User.findOne({
    $or : [{username},{email}]
  })

  if (!user) {
    throw new ApiError(404,'User does not exist')
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401,'Password didnt Matched')
  }

  const { accessToken, refreshToken } = await genrateRefreshAndAccessToken(user._id)

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

  if (!loggedInUser) {
    throw new ApiError(500, 'Error Occured While Logging In User')
  }

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .cookie('sellerId', loggedInUser?.sellerId, cookieOptions)
    .json(new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken: accessToken,
        refreshToken : refreshToken
      },
      'User Logged in Successfully'
  ))
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : { refreshToken : undefined }
    },
    { new : true}
  )
  
  const options = {
    httpOnly: true,
    secure : true
  }

  return res
    .status(200)
    .clearCookie('accessToken',options)
    .clearCookie('refreshToken', options)
    .clearCookie('sellerId', options)
    .json(new ApiResponse(
      200,
      {},
      'User Logout Successfully'
  ))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      user,
      'User Fetched Successfully'
    ))
})

const deleteUser = asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.user._id)
  if (!deletedUser) {
    throw new ApiError(404, 'User not found')
  }
})

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'All fields are required')
  }

  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Old password is incorrect')
  }

  user.password = newPassword
  await user.save()

  return res.status(200).json(new ApiResponse(
    200,
    {},
    'Password updated successfully'
  ))

}) 

const updateUser = asyncHandler(async (req, res) => {
  const { username, email, fullName , phone , website , bio } = req.body

  if (!(username || email || fullName)) {
    throw new ApiError(400, 'One field is required')
  }

  const avatarLocalPath = req?.file?.path
  let avatarURL;
  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
      throw new ApiError(500, 'Error occured while uploading avatar')
    }
    avatarURL = avatar?.url
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: username?.toLowerCase() || user?.username,
        email: email?.toLowerCase(),
        fullName : fullName || user?.fullName,
        avatar: avatarURL || user?.avatar,
        phone: phone || user?.phone,
        website: website || user?.website,
        bio: bio || user?.bio
      }
    },
    { new: true }
  ).select('-password -refreshToken')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return res.status(200).json(new ApiResponse(
    200,
    user,
    'User updated successfully'
  ))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required')
  }

  const user = await User.findOne({ refreshToken })

  if (!user) {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const { accessToken } = await genrateRefreshAndAccessToken(user?._id)

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .json(new ApiResponse(
      200,
      { accessToken },
      'Access token refreshed successfully'
    ))

})

const promoteUserToSeller = asyncHandler(async (req, res) => {
  
  const user = await User.findById(req.user?._id)

  const sellerId = user?.promoteUserToSeller()

  if (!sellerId) {
    throw new ApiError(500, 'Error occured while promoting user to seller')
  }
  
  user.sellerId = sellerId
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(new ApiResponse(
    200,
    { sellerId : sellerId },
    'User promoted to seller successfully'
  ))

})

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  deleteUser,
  updatePassword,
  updateUser,
  refreshAccessToken,
  promoteUserToSeller
}
