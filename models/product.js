const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 }, 
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
}, { timestamps: true });

productSchema.index({ location: '2dsphere' }); 

module.exports = mongoose.model('Product', productSchema);
