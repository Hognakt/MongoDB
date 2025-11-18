# TwitterClone - Application de réseau social

Clone de Twitter développé avec Node.js, Express et MongoDB dans le cadre du TD1 MongoDB.

## 🎯 Fonctionnalités

### Authentification et Profil
- ✅ Inscription avec nom, prénom, email, mot de passe et avatar (base64)
- ✅ Connexion sécurisée avec bcrypt
- ✅ Gestion de session avec express-session
- ✅ Protection des routes (redirection si non connecté)
- ✅ Modification du profil (nom, prénom, email, mot de passe, avatar)

### Messages (Posts)
- ✅ Création de messages publics
- ✅ Ajout d'images en base64
- ✅ Réponses aux messages (imbriquées à l'infini)
- ✅ Réponses aux réponses (structure de forum/Twitter)
- ✅ Affichage chronologique avec auteur et date

### Groupes
- ✅ Création de groupes avec sélection d'utilisateurs
- ✅ Recherche d'utilisateurs pour les ajouter
- ✅ Messages spécifiques aux groupes
- ✅ Réponses dans les groupes
- ✅ Limitation d'accès aux membres du groupe

## 📁 Structure du projet (MVC)

```
TwitterClone/
├── index.js                 # Serveur principal avec routes
├── models/
│   ├── User.js             # Modèle utilisateur
│   ├── Post.js             # Modèle message public
│   ├── Group.js            # Modèle groupe
│   └── GroupPost.js        # Modèle message de groupe
├── controllers/
│   ├── authController.js   # Inscription, connexion, déconnexion
│   ├── userController.js   # Gestion profil utilisateur
│   ├── postController.js   # CRUD messages publics
│   └── groupController.js  # CRUD groupes et messages groupes
├── views/
│   ├── signin.html         # Page de connexion
│   ├── signup.html         # Page d'inscription
│   ├── index.html          # Mur de messages publics
│   ├── profile.html        # Page de profil
│   ├── groups.html         # Liste et création de groupes
│   └── group.html          # Messages d'un groupe
├── package.json
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js v18+ (LTS)
- MongoDB Community Server installé et lancé
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd TwitterClone
```

2. **Installer les dépendances**
```bash
npm install
```

Cela installera :
- `express` : Framework web
- `mongoose` : ODM MongoDB
- `express-session` : Gestion des sessions
- `bcryptjs` : Hashage des mots de passe

3. **Démarrer MongoDB**
```bash
# Sur Windows
net start MongoDB

# Sur macOS/Linux
sudo systemctl start mongod
# ou
brew services start mongodb-community
```

4. **Lancer l'application**
```bash
npm start
# ou en mode développement avec rechargement automatique
npm run dev
```

5. **Accéder à l'application**
Ouvrez votre navigateur : `http://localhost:3000`

## 📝 Utilisation

### 1. Créer un compte
- Aller sur `/signup`
- Remplir le formulaire (prénom, nom, email, mot de passe)
- Optionnel : ajouter un avatar (converti en base64)

### 2. Se connecter
- Aller sur `/signin`
- Entrer email et mot de passe
- Redirection automatique vers l'accueil

### 3. Poster un message
- Sur la page d'accueil `/`
- Écrire un message
- Optionnel : ajouter une image
- Cliquer sur "Publier"

### 4. Répondre à un message
- Sous chaque message, un formulaire de réponse
- Les réponses peuvent avoir des réponses (imbrication infinie)

### 5. Créer un groupe
- Aller sur `/groups`
- Entrer un nom de groupe
- Rechercher et ajouter des utilisateurs
- Cliquer sur "Créer le groupe"

### 6. Poster dans un groupe
- Cliquer sur un groupe dans la liste
- Même principe que les messages publics

### 7. Modifier son profil
- Aller sur `/profile`
- Modifier les informations souhaitées
- Changer l'avatar ou le mot de passe
- Cliquer sur "Mettre à jour"

## 🗄️ Structure de la base de données

### Collection `users`
```javascript
{
  _id: ObjectId,
  firstname: String,
  lastname: String,
  email: String (unique),
  password: String (hashé avec bcrypt),
  avatar: String (base64),
  createdAt: Date
}
```

### Collection `posts`
```javascript
{
  _id: ObjectId,
  author: ObjectId (ref User),
  message: String,
  image: String (base64),
  creationDate: Date,
  answers: [
    {
      author: ObjectId (ref User),
      message: String,
      image: String,
      creationDate: Date,
      answers: [...] // Récursif
    }
  ]
}
```

### Collection `groups`
```javascript
{
  _id: ObjectId,
  name: String,
  users: [ObjectId (ref User)],
  createdBy: ObjectId (ref User),
  createdAt: Date
}
```

### Collection `groupposts`
```javascript
{
  _id: ObjectId,
  group: ObjectId (ref Group),
  user: ObjectId (ref User),
  message: String,
  image: String (base64),
  createdAt: Date,
  answers: [
    {
      user: ObjectId (ref User),
      message: String,
      image: String,
      createdAt: Date,
      answers: [...] // Récursif
    }
  ]
}
```

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ Sessions sécurisées avec express-session
- ✅ Protection des routes (middleware `requireAuth`)
- ✅ Pas d'accès aux pages sans connexion (sauf /signin et /signup)
- ✅ Vérification d'appartenance au groupe avant de poster

## 🎨 Interface utilisateur

- Design moderne avec dégradés et ombres
- Responsive (adapté mobile)
- Avatars par défaut si non fournis
- Prévisualisation des images avant upload
- Messages avec style de forum (réponses imbriquées)
- Navigation claire entre les sections

## 📋 Points du TD réalisés

### TD1 - Partie 1
- ✅ MongoDB Community installé
- ✅ VSCode installé
- ✅ Node.js LTS installé
- ✅ Package.json avec mongoose
- ✅ Collections Users et Posts créées
- ✅ Serveur Express fonctionnel
- ✅ Routes /index, /createMessage, /createAnswer
- ✅ Affichage dynamique AJAX

### TD1 - Suite
- ✅ Structure MVC (controllers par collection)
- ✅ Réponses imbriquées (UI forum/Twitter)
- ✅ Page /signup avec avatar
- ✅ Page de modification de profil
- ✅ Page /signin
- ✅ express-session pour gérer la connexion
- ✅ Protection des routes (redirection si non connecté)
- ✅ Création de groupes avec utilisateurs
- ✅ Page /groups avec liste
- ✅ Messages dans les groupes (collection groupPost)
- ✅ Gestion d'images en base64

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express 5
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : bcryptjs, express-session
- **Frontend** : HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
- **Architecture** : MVC (Model-View-Controller)

## 🐛 Dépannage

### MongoDB ne se connecte pas
```bash
# Vérifier que MongoDB est lancé
sudo systemctl status mongod
# ou
ps aux | grep mongod
```

### Port 3000 déjà utilisé
Modifier le `PORT` dans `index.js` ou arrêter l'autre processus

### Erreur de session
Vérifier que `express-session` est bien installé :
```bash
npm install express-session
```

## 📞 Support

Pour toute question sur ce projet, veuillez consulter la documentation MongoDB ou Express.

---

**Projet réalisé dans le cadre du TD1 MongoDB**