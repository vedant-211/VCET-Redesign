const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  link: { type: String },
  emoji: { type: String, default: '📢' },
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);
