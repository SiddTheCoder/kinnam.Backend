import { Router } from 'express';
import { verifyJWTAuth } from '../middlewares/auth.middleware.js';
import { 
  addProductToCart,
  getCartProducts,
  removeProductFromCart,
  clearCart
} from '../controllers/cart.controller.js';
 
const router = Router()

// secured routes
router.route('/add-product-to-cart/:productId').post(verifyJWTAuth, addProductToCart)

router.route('/remove-product-from-cart/:productId').delete(verifyJWTAuth, removeProductFromCart)

router.route('/get-cart-products').get(verifyJWTAuth, getCartProducts)

router.route('/clear-cart').delete(verifyJWTAuth, clearCart)

export default router