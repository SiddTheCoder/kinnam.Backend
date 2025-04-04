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


  console.log('accessTpken' , accessToken)
  console.log('accessTpken' , refreshToken)

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken')
 


  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
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


export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
}
