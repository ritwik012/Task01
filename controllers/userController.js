const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, location } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or phone number already registered' });
        }

        const hashedPassword = passwordHash.generate(password);
        const user = new User({ firstName, lastName, email, phoneNumber, password: hashedPassword, location });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration', details: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, phoneNumber, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or phone number' });
        }
        if (!passwordHash.verify(password, user.password)) {
            return res.status(400).json({ message: 'Incorrect password' });
        }
        if (!user.approved) {
            return res.status(403).json({ message: 'User not approved by admin' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login', details: err.message });
    }
};

const getNearbyProducts = async (req, res) => {
    try {
        const { location } = req.user;
        const products = await Product.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: location.coordinates },
                    $maxDistance: 10000 // 10 km
                }
            }
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching nearby products', details: err.message });
    }
};

const getUserProductData = async (req, res) => {
    try {
        const aggregatedData = await Order.aggregate([
            {
                $match: { 
                    userId: mongoose.Types.ObjectId(req.user.id) 
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    orderDate: 1,
                    quantity: 1,
                    status: 1,
                    "userDetails.firstName": 1,
                    "userDetails.lastName": 1,
                    "userDetails.email": 1,
                    "productDetails.name": 1,
                    "productDetails.price": 1,
                    "productDetails.description": 1,
                    totalPrice: { 
                        $multiply: ["$quantity", "$productDetails.price"] 
                    }
                }
            }
        ]);

        res.json(aggregatedData);
    } catch (err) {
        res.status(500).json({ 
            error: 'Error aggregating user and product data', 
            details: err.message 
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        const order = new Order({ user: req.user.id, product: productId, quantity });
        product.stock -= quantity;
        await product.save();
        await order.save();
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (err) {
        res.status(500).json({ error: 'Error creating order', details: err.message });
    }
};

module.exports = {
    signup,
    login,
    getNearbyProducts,
    getUserProductData,
    createOrder
};
