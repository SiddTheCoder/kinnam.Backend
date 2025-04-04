import { Router } from "express";
import { verifyJWTAuth } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import {
  uploadProduct,
  updateProductDetails,
  changeProductCategory,
  changeProductRating,
  getAllProducts,
 } from "../controllers/product.controller.js";


const router = Router()

//secured routes
router.route('/upload-product/:categoryId').post(
  upload.single('productImage'),
  verifyJWTAuth,
  uploadProduct
) 

router.route('/update-product-details/:productId').post(verifyJWTAuth,updateProductDetails)

router.route('/change-product-category/product/:productId/category/:categoryId').post(verifyJWTAuth, changeProductCategory)

router.route('/change-product-rating/:productId').post(verifyJWTAuth, changeProductRating)


router.route('/get-all-products').get(verifyJWTAuth,getAllProducts)



export default router