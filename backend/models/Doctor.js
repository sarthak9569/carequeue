const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);