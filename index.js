// ----- IMPORTS -----
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

// ----- CONFIGURATION -----
const app = express();
const PORT = 3000;

// Pour que __dirname fonctionne avec ES modules :
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware pour lire le JSON et les formulaires
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Indique à Express où trouver les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'views')));

// ----- CONNEXION MONGODB -----
mongoose.connect('mongodb://127.0.0.1:27017/td1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('Erreur MongoDB :', err));

// ----- SCHEMAS MONGOOSE -----
const answerSchema = new mongoose.Schema({
  author: String,
  message: String,
  creationDate: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: String,
  message: String,
  creationDate: { type: Date, default: Date.now },
  answers: [answerSchema]
});

const Post = mongoose.model('Post', postSchema);

// ----- ROUTES -----

// Page de connexion
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Page principale (mur)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API : récupérer tous les posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ creationDate: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// API : créer un nouveau message
app.post('/createMessage', async (req, res) => {
  try {
    const { author, message } = req.body;
    const newPost = new Post({ author, message });
    await newPost.save();
    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création du message', error: err });
  }
});

// API : ajouter une réponse à un message
app.post('/createAnswer/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { author, message } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });

    post.answers.push({ author, message });
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de la réponse', error: err });
  }
});

// ----- LANCEMENT DU SERVEUR -----
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});