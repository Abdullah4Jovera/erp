const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pipeline_id:
        [{ type: Schema.Types.ObjectId, ref: 'Pipeline' }],

    status: {
        type: String,
        enum: ['Active', 'UnActive'],
        default: 'UnActive'
    },
    delStatus: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
