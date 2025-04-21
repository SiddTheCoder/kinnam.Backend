import mongoose,{Schema} from "mongoose";

const orderSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  prdoucts: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  orderStatus: {
    type: String,
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    default: "Pending",
  },
  deliveryStatus: {
    type: String,
    default: "Pending",
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  isReturned: {
    type: Boolean,
    default: false,
  },
  isRefunded: {
    type: Boolean,
    default: false,
  },

},{timestamps: true})

export const Order = mongoose.model("Order", orderSchema)