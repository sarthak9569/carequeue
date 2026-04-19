const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const Queue = require('../models/Queue');
const Department = require('../models/Department');
const { VoiceResponse } = twilio.twiml;

// GET/POST /api/ivr/voice
// Entry point for clinical voice calls
router.all('/voice', (req, res) => {
  const twiml = new VoiceResponse();
  const gather = twiml.gather({
    input: 'dtmf',
    numDigits: 1,
    action: '/api/ivr/menu',
  });
  
  gather.say('Welcome to CareQueue Hospital Virtual Sanctuary. For English, press 1. Hindi ke liye, doe dabbaayen.');
  
  // If user doesn't press anything
  twiml.redirect('/api/ivr/voice');
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// POST /api/ivr/menu
router.all('/menu', (req, res) => {
  const digit = req.body.Digits;
  const twiml = new VoiceResponse();

  if (digit === '1' || digit === '2') {
    const gather = twiml.gather({
      input: 'dtmf',
      numDigits: 1,
      action: '/api/ivr/action',
    });
    gather.say('To join the medical queue, press 1. To check your current status, press 2.');
  } else {
    twiml.say('Invalid selection.');
    twiml.redirect('/api/ivr/voice');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// POST /api/ivr/action
router.all('/action', async (req, res) => {
  const digit = req.body.Digits;
  const twiml = new VoiceResponse();

  if (digit === '1') {
    // Join Queue Flow
    twiml.say('Please state your full name after the beep to begin registration.');
    twiml.record({
      maxLength: 10,
      action: '/api/ivr/join',
      playBeep: true,
    });
  } else if (digit === '2') {
    // Status Flow
    const gather = twiml.gather({
      input: 'dtmf',
      action: '/api/ivr/status',
    });
    gather.say('Please enter your queue number followed by the hash key.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// POST /api/ivr/join
router.all('/join', async (req, res) => {
  const twiml = new VoiceResponse();
  // In a real STT scenario, we'd use Twilio's <Gather input="speech">
  // For this version, we gather the name via recording or assume generic
  twiml.say('Thank you. Now, select your department unit. Press 1 for OPD, 2 for Cardiology, 3 for Emergency.');
  
  twiml.gather({
    input: 'dtmf',
    numDigits: 1,
    action: '/api/ivr/finalize',
  });

  res.type('text/xml');
  res.send(twiml.toString());
});

// POST /api/ivr/finalize
router.all('/finalize', async (req, res) => {
  const digit = req.body.Digits;
  const phone = req.body.From;
  const twiml = new VoiceResponse();

  try {
    const departments = await Department.find();
    const targetDept = departments[parseInt(digit) - 1] || departments[0];

    // Generate Token Logic (Simplified duplicate of queueController logic)
    // In production, refactor this into a Service
    const Settings = require('../models/Settings');
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ queue_counter: 0, queue_date: new Date() });
    
    settings.queue_counter += 1;
    await settings.save();

    const entry = await Queue.create({
      queue_number: settings.queue_counter,
      patient_name: 'Voice Caller',
      phone: phone,
      department: targetDept._id,
      source: 'ivr',
      status: 'waiting'
    });

    twiml.say(`Registration complete. Your clinical token number is ${entry.queue_number}. We will notify you when your turn arrives. Goodbye.`);
    twiml.hangup();

    // Trigger Socket.io update
    const io = req.app.get('io');
    if (io) {
      io.emit('queue_updated', { department_id: targetDept._id });
      io.emit('stats_updated');
    }

  } catch (err) {
    twiml.say('We encountered an error processing your request. Please try again later.');
    twiml.hangup();
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// POST /api/ivr/status
router.all('/status', async (req, res) => {
  const qNum = req.body.Digits;
  const twiml = new VoiceResponse();

  try {
    const patient = await Queue.findOne({ queue_number: parseInt(qNum) })
      .populate('department', 'name');

    if (patient) {
      twiml.say(`Token ${qNum} for ${patient.department.name} is currently ${patient.status}. Goodbye.`);
    } else {
      twiml.say('Queue number not found. Goodbye.');
    }
  } catch (err) {
    twiml.say('System error.');
  }

  twiml.hangup();
  res.type('text/xml');
  res.send(twiml.toString());
});

module.exports = router;
