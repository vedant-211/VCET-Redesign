const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Enquiry = require('../models/Enquiry');

// Public route to get active notices
router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find({ status: 'active' }).sort({ createdAt: -1 }).limit(10);
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public route to get events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).limit(5);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public route to submit an enquiry
router.post('/enquiries', async (req, res) => {
  try {
    const { name, email, phone, course } = req.body;
    if (!name || !email || !phone || !course) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const enquiry = await Enquiry.create({ name, email, phone, course });
    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
