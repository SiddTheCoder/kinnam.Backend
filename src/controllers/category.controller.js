import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Category } from '../models/category.model.js'
// import { Product } from '../models/product.model.js'
import { User } from '../models/user.model.js'
import mongoose from 'mongoose'

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  if (!name) {
    throw new ApiError(400,'Category Name is required')
  }

  const user = await User.findById(req.user?._id)
  if (!user) {
    throw new ApiError(404,'User with such ID didnt exist')
  }

  const newCategory = await Category.create({
    name,
    owner: req.user?._id
  })

    if (!newCategory) {
    throw new ApiError(500, 'Error Occured while creating new category')
  }

  user.product_categories?.push(newCategory._id)
  await user.save()

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      newCategory,
      'New Category Created SuccessFully'
  ))
})

const getAllCategories = asyncHandler(async (req, res) => {

  const { userId } = req.params

  if (!userId) {
    throw new ApiError(404,'User with such ID didnt exist')
  }

  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(404,'User with such ID didnt exist')
  }

  const categories = await Category.aggregate([
    {
      $match: { 
        owner : new mongoose.Types.ObjectId(userId)
      }
    }
  ])

  if (!categories) {
    throw new ApiError(404,'Categories with such ID didnt exist')
  }
  
  if (categories.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(
        200,
        [],
        "No categories found"
    ))
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      categories,
      "All categories fetched Successfully"
  ))
})


const getCategoryProducts = asyncHandler(async (req, res) => {
  const { categoryId } = req.query
  if (!categoryId) {
    throw new ApiError(400,'Category ID is required')
  }

  const category = await Category.findById(categoryId).populate('products')
  console.log(category)

  if (!category) {
    throw new ApiError(404,'Category with such ID does not exist')
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      category,
      'All Products fetched SuccessFully'
  ))
  
})

const getAllCategoriesWithProducts = asyncHandler(async (_, res) => { 
  const categories = await Category.find({}).populate('products')
  if (categories.length < 0) {
    throw new ApiError(404,'Categories with such ID didnt exist')
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      categories,
      'All Categories fetched SuccessFully'
  ))
})

export { 
  createCategory,
  getAllCategories,
  getCategoryProducts,
  getAllCategoriesWithProducts
}

