const express = require('express');
const { signup, login, getNearbyProducts, getUserProductData, createOrder } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/products', verifyToken, getNearbyProducts); 
router.get('/user-products', verifyToken, getUserProductData); // New route for aggregation
router.post('/order', verifyToken, createOrder); 

module.exports = router;
