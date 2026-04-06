const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  status: { type: String, enum: ['new', 'contacted'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', EnquirySchema);
