const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pipeline: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: false, // Allow null or undefined
    }],
 
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    image: { type: String },
    role: { type: String, required: true },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: false, 
    },
    // branch: {
    //  type: String 
    // },
    phone: {
      type: String,
      
    },
    commission: {
      type: Number,
      default: 0
  },  
    products: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false, // Allow null or undefined
    },
    permissions: [{ type: String }],
    isBlocked: { type: Boolean, default: false }, // New field
    verified: { type: Boolean, default: false },
    delstatus: { type: Boolean, default: false },
    resigned: { type: Boolean, default: false },

  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
 