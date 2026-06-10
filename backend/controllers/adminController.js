const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Schedule = require('../models/Schedule');
const AuditLog = require('../models/AuditLog');

// Hospital Listing
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).select('name code address type website contact');
    res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Hospital Profile Management
exports.createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ adminId: req.user.id });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Department Listing
exports.getDepartments = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const filter = hospitalId ? { hospital: hospitalId, status: 'Active' } : { status: 'Active' };
    const departments = await Department.find(filter);
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Department Management
exports.manageDepartment = async (req, res) => {
  try {
    const { action } = req.body;
    let dept;
    if (action === 'create') {
      dept = await Department.create(req.body);
    } else if (action === 'update') {
      dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else if (action === 'disable') {
      dept = await Department.findByIdAndUpdate(req.params.id, { status: 'Inactive' }, { new: true });
    }
    res.status(200).json({ success: true, data: dept });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Doctor Management
exports.onboardDoctor = async (req, res) => {
  try {
    const { name, email, password, department, hospital, qualification, specialization, medicalRegistrationNumber } = req.body;
    
    // Create User account first
    const user = await User.create({ name, email, password, role: 'doctor' });
    
    // Create Doctor profile
    const doctor = await Doctor.create({
      userId: user._id,
      name,
      email,
      department,
      hospital,
      qualification,
      specialization,
      medicalRegistrationNumber
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'Doctor Onboarded',
      entity: 'Doctor',
      entityId: doctor._id,
      details: `Onboarded doctor ${name}`
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ adminId: req.user.id });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    
    const doctors = await Doctor.find({ hospital: hospital._id }).populate('department', 'name');
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Leave Management
exports.applyLeave = async (req, res) => {
  try {
    const leave = await Leave.create({ ...req.body, status: 'Pending' });
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const leaves = await Leave.find({ hospital: hospitalId }).populate('applicant', 'name').sort('-createdAt');
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.handleLeave = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, {
      status,
      approvalDate: Date.now(),
      approvedBy: req.user.id
    }, { new: true });
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Staff Management
exports.getStaff = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const staff = await Staff.find({ hospital: hospitalId }).populate('department', 'name');
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.manageStaff = async (req, res) => {
  try {
    const { action } = req.body;
    let staff;
    if (action === 'create') {
      staff = await Staff.create(req.body);
    } else if (action === 'update') {
      staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else if (action === 'remove') {
      await Staff.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Staff removed' });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Schedule Management
exports.getSchedules = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const schedules = await Schedule.find({ hospital: hospitalId }).populate('doctor', 'name').populate('department', 'name');
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.manageSchedule = async (req, res) => {
  try {
    const { action, id } = req.body;
    let schedule;
    if (action === 'create') {
      schedule = await Schedule.create(req.body);
    } else if (action === 'update') {
      schedule = await Schedule.findByIdAndUpdate(id, req.body, { new: true });
    }
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Advanced Analytics Data
exports.getAnalytics = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const hospital = hospitalId ? { _id: hospitalId } : await Hospital.findOne({ adminId: req.user.id });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    // In a real system, these would use mongo aggregation of Tokens/Appointments
    const stats = {
      today: {
        totalPatients: Math.floor(Math.random() * 200), // Simulated
        avgWaitTime: '18m',
        activeDepartments: await Department.countDocuments({ hospital: hospital._id, status: 'Active' }),
        busyDepartments: 2
      },
      deptWise: [
        { name: 'Cardiology', count: 12, workload: 'High' },
        { name: 'ENT', count: 5, workload: 'Medium' }
      ]
    };
    
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

