const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
     name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    color: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL']
    },
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;