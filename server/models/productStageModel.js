const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productStageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',  
    required: true, 
  },
  pipeline_id: {
    type: Schema.Types.ObjectId,
    ref: 'Pipeline',  
  },
  //   pipeline_id: {
  //   type:String,
    
  // },
  order: {
    type: Number,
    required: true,
  },
  delstatus: {
    type: Boolean,
    default: false, // false means not deleted
  }
}, {
  timestamps: true  
});

const ProductStage = mongoose.model('ProductStage', productStageSchema);
module.exports = ProductStage;
