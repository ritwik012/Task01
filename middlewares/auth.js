const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; 
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

const checkRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
    }
    next();
};

module.exports = { verifyToken, checkRole };
