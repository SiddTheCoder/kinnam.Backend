import { Router } from "express";
import {
    loginUser,
    registerUser
} from '../controllers/user.controller.js'

const router = Router()

//unsecured routes
router.route('/register-user').post(registerUser)
router.route('/login-user').post(loginUser)

//secured routes


export default router