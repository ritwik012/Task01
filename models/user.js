const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, 
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },}, { timestamps: true });

userSchema.index({ location: '2dsphere' }); 

module.exports = mongoose.model('User', userSchema);
