const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  applicant: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'applicantModel', 
    required: true 
  },
  applicantModel: {
    type: String,
    required: true,
    enum: ['Doctor', 'Staff']
  },
  leaveDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  approvalDate: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
