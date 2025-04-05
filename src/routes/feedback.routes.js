import { Router } from "express";

import {
  addFeedBack,
  getAllFeedBacks,
  updateFeedBack,
  deleteFeedBack
 } from "../controllers/feedback.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWTAuth } from "../middlewares/auth.middleware.js"


const router = Router()

router.route('/add-feedback/:productId').post(
  upload.fields([{ name: 'photos', maxCount: 5 }]),
  verifyJWTAuth,
  addFeedBack
)

router.route('/get-all-feedbacks/:productId').get(verifyJWTAuth, getAllFeedBacks)

router.route('/update-feedback/:feedbackId').put(verifyJWTAuth, updateFeedBack)
router.route('/delete-feedback/:feedbackId').delete(verifyJWTAuth, deleteFeedBack) 

export default router