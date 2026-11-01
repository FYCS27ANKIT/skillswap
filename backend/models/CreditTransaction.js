const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null indicates system credit bonus
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  type: {
    type: String,
    enum: ['signup_bonus', 'session_payment', 'direct_transfer', 'workshop'],
    default: 'session_payment',
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);
module.exports = CreditTransaction;
