import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Product } from '../models/product.model.js'
import { Cart } from '../models/cart.model.js'


const addProductToCart = asyncHandler(async (req, res) => { 
  const { productId } = req.params
  const userId = req.user?._id

  if (!productId) {
    throw new ApiError(400, 'Product ID is required to add to cart')
  }

  // Check if the product exists
  const product = await Product.findById(productId)
  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  // Find or create the user's cart
  let cart = await Cart.findOne({ user: userId })
  if (!cart) {
    cart = await Cart.create({ user: userId, products: [] })
  }

  // Check if the product is already in the cart
  if (cart.products.includes(productId)) {
    throw new ApiError(400, 'Product already in cart')
  }

  // Add the product to the cart
  cart.products.push(productId)
  await cart.save()

  return res
  .status(200)
  .json(new ApiResponse(
    200,
    cart,
    'Product added to cart successfully'
  ))
})


const removeProductFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const userId = req.user?._id

  if (!productId) {
    throw new ApiError(400, 'Product ID is required to remove from cart')
  }

  // Find the user's cart
  const cart = await Cart.findOne({ user: userId })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  // Check if the product is in the cart or not 
  if (!cart.products.includes(productId)) {
    throw new ApiError(400, 'Product not in cart')
  }

  // Remove the product from the cart
  cart.products = cart.products.filter(id => id.toString() !== productId)
  await cart.save()

  return res
    .status(200)
    .json(new ApiResponse(
    200,
    cart,
    'Product removed from cart successfully'
  ))

})
 

const getCartProducts = asyncHandler(async (req, res) => { 
  const userId = req.user?._id

  // Find the user's cart
  const cart = await Cart.findOne({ user: userId }).populate('products')
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      cart.products,
      'Cart products retrieved successfully'
    ))
})

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  // Find the user's cart
  const cart = await Cart.findOne({ user: userId })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  // Clear the cart
  cart.products = []
  await cart.save()

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      cart,
      'Cart cleared successfully'
    ))
 })

export {
  addProductToCart,
  removeProductFromCart,
  getCartProducts,
  clearCart
}
