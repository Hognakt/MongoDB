import User from '../models/user.js';

const authController = {
  async signup(req, res) {
    try {
      const { firstname, lastname, email, password, avatar } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }

      const user = new User({ firstname, lastname, email, password, avatar });
      await user.save();

      req.session.userId = user._id;
      res.json({ success: true, user: { _id: user._id, firstname, lastname, email, avatar } });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la création du compte', error: err.message });
    }
  },

  async signin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      req.session.userId = user._id;
      res.json({ 
        success: true, 
        user: { 
          _id: user._id, 
          firstname: user.firstname, 
          lastname: user.lastname, 
          email: user.email,
          avatar: user.avatar 
        } 
      });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la connexion', error: err.message });
    }
  },

  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      res.json({ success: true });
    });
  },

  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.session.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  }
};

export default authController;