import { Router } from "express";
import { verifyJWTAuth } from '../middlewares/auth.middleware.js'
import {
  addComment,
  getCommentsByFeedbackId,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
  addReplyToComment,
  getRepliesToComment
} from "../controllers/comment.controller.js";
 

const router = Router()


//secured routes
router.route('/add-comment/:feedbackId').post(verifyJWTAuth, addComment)
router.route('/get-comments/:feedbackId').get(verifyJWTAuth, getCommentsByFeedbackId) 
router.route('/update-comment/:commentId').put(verifyJWTAuth, updateComment)
router.route('/delete-comment/:commentId').delete(verifyJWTAuth, deleteComment)
router.route('/like-comment/:commentId').post(verifyJWTAuth, likeComment)
router.route('/dislike-comment/:commentId').post(verifyJWTAuth, dislikeComment)
router.route('/add-reply-to-comment/:commentId').post(verifyJWTAuth, addReplyToComment)
router.route('/get-replies-to-comment/:commentId').get(verifyJWTAuth, getRepliesToComment)


export default router