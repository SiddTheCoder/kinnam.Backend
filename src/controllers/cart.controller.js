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
    cart = await Cart.create({
      user: userId,
      products: [
        {
          product: productId,
          quantity: 1,
          price: product.price,
          discount: product.discount,
          totalPrice: product.price - (product.price * product.discount / 100)
        }
      ]
    })  
  } else {

    // Check if the product is already in the cart
    const isAlreadyInCart = cart.products.some(item => item.product.toString() === productId.toString())
    
    if (isAlreadyInCart) {
      throw new ApiError(400, 'Product already in cart')
    }
    
    // else add the product to the cart
    cart.products.push({
      product: productId,
      quantity: 1,
      price: product.price,
      discount: product.discount,
      totalPrice: product.price - (product.price * product.discount / 100)
    })

  }

 // Save the cart
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
  const isInCart = cart.products.some(
    item => item.product.toString() === productId.toString()
  );

  if (!isInCart) {
  throw new ApiError(400, 'Product not in cart');
  }
  
  // Remove the product from the cart
  cart.products = cart.products.filter(item => item.product.toString() !== productId.toString())
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
  const cart = await Cart.findOne({ user: userId }).populate('products.product')
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
  const newEmptyCart = await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { products: [] } },
    { new: true }
  )
  if (!cart) {
    throw new ApiError(500, 'Error occurred while clearing the cart')
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      newEmptyCart,
      'Cart cleared successfully'
    ))
})
 
const updateProductQuantity = asyncHandler(async (req, res) => { 

  const { productId } = req.params
  const { quantity } = req.query

  if (!productId) {
    throw new ApiError(400, 'Product ID is required to update quantity')
  }
  
  if (!quantity) {
    throw new ApiError(400, 'Quantity is required to update')
  }

  console.log('quantity', quantity)

  if (parseInt(quantity) < 1) {
    throw new ApiError(400, 'Quantity must be greater than 0')
  }

  // Find the user's cart
  const userId = req.user?._id

  const cart = await Cart.findOne({ user: userId })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  // Check if the product is in the cart or not
  const isInCart = cart.products.some(item => item.product.toString() === productId.toString())

  if (!isInCart) {
    throw new ApiError(400, 'Product not in cart')
  }

  console.log('Before Carts Products', cart.products)
  // Update the product quantity in the cart
  cart.products = cart.products.map(item => {
    if (item.product.toString() === productId.toString()) {
      item.quantity = parseInt(quantity)
      const discountedPrice = parseInt(item.price) - (parseInt(item.price)* parseInt(item.discount) / 100);
      item.totalPrice = discountedPrice * parseInt(quantity);
    }
    return item
  })

  console.log('After Carts Products', cart.products)

  cart.markModified('products');  // ✅ Ensure Mongoose detects changes
  await cart.save({validateBeforeSave: false}) // ✅ Disable validation before saving


  return res
    .status(200)
    .json(new ApiResponse(
      200,
      cart,
      'Product quantity updated successfully'
    ))
  
})

export {
  addProductToCart,
  removeProductFromCart,
  getCartProducts,
  clearCart,
  updateProductQuantity
}
