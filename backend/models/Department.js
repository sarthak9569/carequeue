const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  avg_consultation_time: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
