const express = require('express');
const {
    login, getUserList, createProduct, updateUserStatus, deleteUser, createWarehouse,
    addProductToWarehouse, acceptOrder, rejectOrder, checkLowStock
} = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const router = express.Router();

router.post('/login', login);
router.get('/users', verifyToken, checkRole('admin'), getUserList);
router.post('/products', verifyToken, checkRole('admin'), createProduct);

router.put('/user/status', verifyToken, checkRole('admin'), updateUserStatus); 
router.delete('/user/:userId', verifyToken, checkRole('admin'), deleteUser); 

router.post('/warehouse', verifyToken, checkRole('admin'), createWarehouse); 
router.post('/warehouse/product', verifyToken, checkRole('admin'), addProductToWarehouse); 
router.post('/order/accept', verifyToken, checkRole('admin'), acceptOrder); 
router.post('/order/reject', verifyToken, checkRole('admin'), rejectOrder); 

router.use(checkLowStock); 
module.exports = router;
