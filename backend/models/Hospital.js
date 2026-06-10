const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: { type: String },
  pincode: { type: String },
  contact: { type: String },
  email: { type: String, required: true },
  website: { type: String },
  registrationNumber: { type: String },
  type: { 
    type: String, 
    enum: ['Government', 'Private', 'Trust'], 
    default: 'Private' 
  },
  settings: {
    maxDailyPatients: { type: Number, default: 1000 },
    allowOnlineBooking: { type: Boolean, default: true },
    workingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
