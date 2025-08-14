const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
