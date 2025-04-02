import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
  username: {
    type: String,
    required : true,
    lowercase : true,
    unique : true,
    trim : true,
    index : true,
  },
  email: {
    type : 'string',
    required : true,
    lowercase : true,
    unique : true,
    trim : true,
  },
  fullName: {
    type: String,
    required : true,
    trim : true
  },
  password: {
    type: String,
    required : true,
  },
  avatar: {
    type: String,
    default : null
  },
  location: {
    type: String,
    default : 'Kathmandu, Anamnagar-13, SinghDurbar'
  },
  product_category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'Category'
    }
  ],
  refreshToken: {
    type: String,
  }
}, {timestamps : true})


//password hassing middleare
userSchema.pre('save', async function (next) {
  if (!this.isModified(password)) {
    return next()
  }
  this.password = await bcrypt.hash(this.password, 10)
  next()
})


//password checking method
userSchema.methods.isPassowrdCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}



// acccessToken generation
userSchema.methods.generateAccessToken = function () {
  jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullName : this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

//refreshToken
userSchema.methods.generateRefreshToken = function () {
  jwt.sign(
    {
      _id: this._id,
      username : this.username
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model('User',userSchema)