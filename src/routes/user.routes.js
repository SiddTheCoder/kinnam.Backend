import { Router } from "express";
import {verifyJWTAuth} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    deleteUser,
    updatePassword,
    updateUser,
    refreshAccessToken,
    promoteUserToSeller
} from '../controllers/user.controller.js'

const router = Router()

//unsecured routes
router.route('/register-user').post(registerUser)
router.route('/login-user').post(loginUser)

//secured routes
router.route('/logout-user').post(verifyJWTAuth, logoutUser)
router.route('/current-user').get(verifyJWTAuth, getCurrentUser)
router.route('/delete-user').delete(verifyJWTAuth, deleteUser)
router.route('/update-password').put(verifyJWTAuth, updatePassword)
router.route('/update-user').put(upload.single('avatar'), verifyJWTAuth, updateUser)
router.route('/refresh-access-token').get(refreshAccessToken)
router.route('/promote-user-to-seller').post(verifyJWTAuth, promoteUserToSeller)

export default router