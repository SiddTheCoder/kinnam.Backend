import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

//middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials : true,
}))

app.use(cookieParser())

app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

//import routes
import userRouter from './routes/user.routes.js'
import categoryRouter from './routes/category.routes.js'
import productRouter from './routes/product.routes.js'
import cartRouter from './routes/cart.routes.js'
import feedbackRouter from './routes/feedback.routes.js'
import commentRouter from './routes/comment.routes.js'

//use routes
app.use('/api/v1/u', userRouter)
app.use('/api/v1/c',categoryRouter)
app.use('/api/v1/product', productRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/feedback', feedbackRouter)
app.use('/api/v1/comment', commentRouter)




export default app