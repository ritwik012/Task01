const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        stock: { type: Number, required: true, default: 0 }
    }]
}, { timestamps: true });

warehouseSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Warehouse', warehouseSchema);
