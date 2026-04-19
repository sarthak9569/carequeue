const express = require('express');
const router = express.Router();
const {
  joinQueue, getQueue, getPatientStatus,
  getStats, completePatient, callNext, resetQueue,
} = require('../controllers/queueController');

router.post('/join', joinQueue);
router.get('/departments', (req, res) => {
  const Department = require('../models/Department');
  Department.find().then(depts => res.json({ success: true, departments: depts }));
});
router.get('/', getQueue);
router.get('/status', getPatientStatus);
router.get('/stats', getStats);
router.put('/complete/:id', completePatient);
router.post('/next', callNext);
router.post('/reset', resetQueue);

module.exports = router;