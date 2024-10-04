// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId },
  username: { type: String, required: true, unique: true },
  expoPushToken: { type: String, required: true },
  deviceInfo: { type: String }
});

export const NotificaUser = mongoose.model('NotificaUser', userSchema, "NotifiesUser");
