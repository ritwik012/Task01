const Product = require('../models/product');

const checkLowStock = async (req, res, next) => {
    try {
        const lowStockProducts = await Product.find({ stock: { $lte: 10 } });
        if (lowStockProducts.length) {
            console.warn('Low stock warning:', lowStockProducts);
        }
        next();
    } catch (error) {
        console.error('Error checking low stock:', error);
        next(error);
    }
};



module.exports = { checkLowStock };
