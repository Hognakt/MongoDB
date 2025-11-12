const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  message: String,
  author: String,
  creationDate: { type: Date, default: Date.now },
  answers: [
    {
      message: String,
      author: String,
      creationDate: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Post', postSchema);