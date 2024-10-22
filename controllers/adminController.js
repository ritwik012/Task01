const jwt = require('jsonwebtoken');
const passwordHash = require('password-hash');
const User = require('../models/user');
const Product = require('../models/product');
const Warehouse = require('../models/warehouse');
const Order = require('../models/order');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'admin' });
        if (!user || !passwordHash.verify(password, user.password)) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error });
    }
};

const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const product = await Product.create(productData);
        res.status(201).json({ 
            message: 'Product created successfully', 
            product 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating product', 
            error 
        });
    }
};
const getUserList = async (req, res) => {
    try {
        const { search } = req.query;
        const query = search ? {
            $or: [
                { firstName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phoneNumber: new RegExp(search, 'i') }
            ]
        } : {};
        const users = await User.find(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;
        const validStatuses = ['pending', 'approved', 'rejected'];
    
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Invalid user status' });
        }
    
        const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
        res.json(user);
      } catch (error) {
        res.status(400).json({ message: 'Error updating user status', error });
      }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

const createWarehouse = async (req, res) => {
    try {
        const { name, longitude, latitude } = req.body;

        const warehouse = new Warehouse({
            name,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
            products: []
        });

        await warehouse.save();
        res.status(201).json({ message: 'Warehouse created', warehouse });
    } catch (error) {
        res.status(500).json({ message: 'Error creating warehouse', error });
    }
};

const addProductToWarehouse = async (req, res) => {
    try {
        const { warehouseId, productId, quantity } = req.body;
        
        // First check if you're getting the correct data
        console.log('Request Data:', { warehouseId, productId, quantity });

        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        // Log warehouse data
        console.log('Warehouse found:', warehouse);

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Log product data
        console.log('Product found:', product);

        // Check if product already exists in warehouse
        const productIndex = warehouse.products.findIndex(p => 
            p.product && p.product.toString() === productId
        );

        if (productIndex >= 0) {
            warehouse.products[productIndex].stock += quantity;
        } else {
            warehouse.products.push({ product: productId, stock: quantity });
        }

        // Log warehouse before saving
        console.log('Warehouse before save:', warehouse);

        await warehouse.save();

        // Update product stock
        product.stock += quantity;
        await product.save();

        res.json({ 
            message: 'Product added to warehouse', 
            warehouse,
            product 
        });
    } catch (error) {
        console.error('Full error:', error); // This will show the full error in console
        res.status(500).json({ 
            message: 'Error adding product to warehouse', 
            error: error.message  // Send error message to client
        });
    }
};

const acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'accepted';
        await order.save();

        res.json({ message: 'Order accepted', order });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting order', error });
    }
};

const rejectOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'rejected';
        await order.save();

        res.json({ message: 'Order rejected', order });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting order', error });
    }
};

const checkLowStock = async (req, res, next) => {
    try {
        const lowStockProducts = await Product.find({ stock: { $lte: 10 } });
        if (lowStockProducts.length) {
            console.log('Low stock warning:', lowStockProducts);
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking stock', error });
    }
};

module.exports = {
    login,
    getUserList,
    updateUserStatus,
    createProduct,
    deleteUser,
    createWarehouse,
    addProductToWarehouse,
    acceptOrder,
    rejectOrder,
    checkLowStock
};
