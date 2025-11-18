import mongoose from 'mongoose';

const groupAnswerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  image: String, // Base64
  createdAt: { type: Date, default: Date.now },
  answers: [this] // Réponses imbriquées
});

const groupPostSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  image: String, // Base64
  createdAt: { type: Date, default: Date.now },
  answers: [groupAnswerSchema]
});

export default mongoose.model('GroupPost', groupPostSchema);