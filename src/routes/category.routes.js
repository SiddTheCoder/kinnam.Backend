import { Router } from "express";
import { verifyJWTAuth } from '../middlewares/auth.middleware.js'

import {
  createCategory,
  getAllCategories,
  getCategoryProducts,
  getAllCategoriesWithProducts
 } from "../controllers/category.controller.js";


const router = Router()

// for all categories with products
// this route is not secured as it is used for fetching all categories and products for home page
router.route('/get-all-categories').get(verifyJWTAuth, getAllCategoriesWithProducts)


//secured routes
router.route('/create-category').post(verifyJWTAuth,createCategory) 

router.route('/get-categories/:userId').get(verifyJWTAuth,getAllCategories)

router.route('/get-category-products').get(verifyJWTAuth, getCategoryProducts)



export default router