import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
    console.log('🌟 Connected to MongoDB at',connectionInstance.connection.host)
  } catch (error) {
    console.log('Error Occured While Connection to DB', error)
    process.exit(1)
  }
}

export default connectDB