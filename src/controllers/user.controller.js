import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import { cookieOptions, emailRegex } from '../constant.js'

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
   
   return { refreshToken, accessToken }
   
 } catch (error) {
  throw new ApiError(500 , 'Error occured while generating refresh & Access Token')
 }
}

function isValidEmailFormat(email) {
    return emailRegex.test(email);
}

const registeruser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body
  
  if ((username, email, fullName, password).some((field) => field?.trim() === '')) {
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

export {
  registeruser
}
