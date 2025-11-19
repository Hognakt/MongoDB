import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// Controllers
import authController from './controllers/authController.js';
import postController from './controllers/postController.js';
import userController from './controllers/userController.js';
import groupController from './controllers/groupController.js';

// Configuration
const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: '50mb' })); // Pour les images en base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'views')));

// Configuration session
app.use(session({
  secret: 'twitter-clone-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // mettre true en production avec HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 heures
  }
}));

// Connexion MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/td1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// Middleware de vérification d'authentification
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  next();
};

// Routes publiques (sans authentification)
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signin.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/signin', authController.signin);

// Routes protégées (nécessitent authentification)
app.use(requireAuth);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/groups', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'groups.html'));
});

app.get('/group/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'group.html'));
});

// API Routes - Auth
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/me', authController.getCurrentUser);

// API Routes - Users
app.get('/api/users/me', userController.getProfile);
app.put('/api/users/me', userController.updateProfile);
app.get('/api/users/search', userController.searchUsers);

// API Routes - Posts
app.get('/api/posts', postController.getAllPosts);
app.post('/api/posts', postController.createPost);
app.post('/api/posts/:postId/answers', postController.createAnswer);

// API Routes - Groups
app.get('/api/groups', groupController.getAllGroups);
app.post('/api/groups', groupController.createGroup);
app.get('/api/groups/:groupId', groupController.getGroup);
app.post('/api/groups/:groupId/members', groupController.addMembersToGroup); // ← AJOUTER CETTE LIGNE
app.post('/api/groups/:groupId/posts', groupController.createGroupPost);
app.get('/api/groups/:groupId/posts', groupController.getGroupPosts);
app.post('/api/groups/:groupId/posts/:postId/answers', groupController.createGroupAnswer);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});