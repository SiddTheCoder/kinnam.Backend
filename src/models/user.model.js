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
  bio: {
    type: String,
    default: 'I am a software engineer'
  },
  website: {
    type: String,
    default : 'https://www.example.com'
  },
  phone: {
    type: String,
    default : null
  },
  product_categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'Category'
    }
  ],
  products: [
    {
      type: Schema.Types.ObjectId,
      ref:'Product'
    }
  ],
  refreshToken: {
    type: String,
  },
  sellerId: {
    type: String,
    default : null
  }
}, {timestamps : true})


//password hassing middleare
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  this.password = await bcrypt.hash(this.password, 10)
  next()
})


//password checking method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}



// acccessToken generation
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
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
  return jwt.sign(
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

// sellerId generation ( Promote to seller)
// this method will be called when a user is promoted to seller
userSchema.methods.promoteUserToSeller = async function () {
  if (!this.sellerId) {
    this.sellerId = `seller_${this._id}`
    await this.save()
  }
  return this.sellerId
}

export const User = mongoose.model('User',userSchema)