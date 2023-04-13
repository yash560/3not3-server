const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  razorpay_payment_id: { type: String, required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
  success: { type: Boolean, default: false },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
