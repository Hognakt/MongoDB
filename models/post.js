import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  image: String, // Base64
  creationDate: { type: Date, default: Date.now },
  answers: [this] // Réponses imbriquées
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  image: String, // Base64
  creationDate: { type: Date, default: Date.now },
  answers: [answerSchema]
});

export default mongoose.model('Post', postSchema);