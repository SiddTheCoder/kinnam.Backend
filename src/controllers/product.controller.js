import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Product } from '../models/product.model.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'
import { Category } from '../models/category.model.js'
import { User } from '../models/user.model.js'



const uploadProduct = asyncHandler((async (req, res) => {

  const { categoryId } = req.params
   if (!categoryId) {
    throw new ApiError(400,'Category ID is required for storing Product')
  }


  //taking data
  const { name, details, specifications, price, stock, discount, brand, warrantyAvailable, returnBackDays } = req.body
  
  if ([name, price, brand].some((field) => field?.trim() === '')) {
    throw new ApiError(400,'Produt Name,Price,Brand is required')
  }

  const productImageLocalFilePath = req.file?.path

  if (!productImageLocalFilePath) {
    throw new ApiError(404,'Error occured while loading image by Multer')
  }

  const productImage = await uploadOnCloudinary(productImageLocalFilePath)

  if (!productImage) {
    throw new ApiError(500,'Error occured while uploading image on Cloudinary')
  }

  const newProduct = await Product.create({
    name: name,
    details: details,
    category: categoryId,
    // specifications: specifications,
    owner: req.user?._id,
    price: price,
    stock: stock,
    discount: discount,
    productImage: productImage?.url,
    brand: brand,
    returnBackDays: returnBackDays,
    warrantyAvailable : warrantyAvailable
  })

  if (!newProduct) {
    throw new ApiError(500, 'Error Occured while creating new product')
  }


     // Extracting pre-models for updating them
  const category = await Category.findById(categoryId)
  if (!category) {
    throw new ApiError(400,'Category ID is required for storing Product')
  }
  const user = await User.findById(req.user?._id)

  // saving into pre-models
  category.products.push(newProduct?._id)
  user.products.push(newProduct?._id)

  await category.save({ validateBeforeSave: false })
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      newProduct,
      'Product has been created Successfully'
  ))

}))

const updateProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params
  
  if (!productId) {
    throw new ApiError(400,'Product ID is required')
  }

  const product = await Product.findById(productId)

  if (!product) {
    throw new ApiError(404,'Product didnt Found')
  }
  const { name, details, specifications, price, stock, discount, brand, warrantyAvailable, returnBackDays } = req.body

 

  // // here we are converting the req.body into array first then filtering the array and then again converting back into object so that we can $set it into models for update
  // //  Object.fromEntries -->  converts array to obj
  // //  Object.entries -->  converts obj to array

  const updateFields = Object.fromEntries(
    Object.entries(req.body).filter(([key, value]) => value !== undefined)
  )

  if (!req.body || Object.keys(updateFields).length === 0) {
    throw new ApiError(400,'Atleast one field is required to Update Product')
  }

  // if (!(name || details || specifications || price || stock || discount || brand || warrantyAvailable || returnBackDays)) {
  // throw new ApiError(400, 'At least one field is required for update');
  // }
  



  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: updateFields
    },
    { new : true}
  )

  if (!updatedProduct) {
    throw new ApiError(500,'Error occured while updating the product details')
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
      updatedProduct,
      'Product Details Updated Successfully'
      )
  )

})

const changeProductCategory = asyncHandler(async (req, res) => {
  const { productId, categoryId } = req.params

  if (!productId) {
    throw new ApiError(400,'Product ID is required')
  }

  if (!categoryId) {
    throw new ApiError(400,'Category ID is required')
  }

  const product = await Product.findById(productId)
  if (!product) throw new ApiError(404, 'No Product with such ID found')
  
  product.category = categoryId

  try {
    await product.save({ validateBeforeSave: false })
  } catch (error) {
    throw new ApiError(500,'Error occured while updating the category')
  }
  
  return res
    .status(200).
    json(new ApiResponse(
      200,
      product,
      'Product Category Changed SuccessFully'
  ))
})

const changeProductRating = asyncHandler(async (req, res) => {

  const { productId } = req.params
  if (!productId) {
    throw new ApiError(400,'Product ID is required')
  }
  const { rate } = req.query
   if (!rate) {
    throw new ApiError(400,'Rating value is required')
  }
  
  const product = await Product.findById(productId).select('rating')

  // ensures that the field exist
  if (!product.ratedData) {
    product.ratedData = []
  }

  const existingRateData = product.ratedData.find((field) => field.user?.toString() === req.user?._id?.toString())

  console.log('Existing ',existingRateData)
  
  if (existingRateData) {
    existingRateData.rating = parseInt(rate)
  } else {
    product.ratedData?.push({
      user: req.user?._id,
      rating: parseInt(rate)
    })
  
  }

  //holding the rateData in var
  const updatedRatedData = product.ratedData

  // adding all rate values 
  const newRateSummation = updatedRatedData.map((field) => field?.rating).reduce((acc, currentValue) => acc + currentValue, 0)
  

  //averaging the rate value
  const newRating = newRateSummation/updatedRatedData?.length

  //overwriting the rating in model
  product.rating = newRating  

  await product.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      product,
      'Rating Addedd to Product'
  ))

})

const getAllProducts = asyncHandler(async (req, res) => {
  const { userId } = req.query

  if (!userId) {
    throw new ApiError(400,'User ID is required')
  }

  const user = await User.findById(userId).populate({
    path: 'products',
    populate : {
      path : 'category',
      select : 'name'
    }
  })

  if (!user) {
    throw new ApiError(404,'User with such ID didnt exist')
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      user.products,
      'All Products Fetched Successfully'
  ))
} )

export {
  uploadProduct,
  updateProductDetails,
  changeProductCategory,
  changeProductRating,
  getAllProducts,
}