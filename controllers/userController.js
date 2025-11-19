import User from '../models/user.js';
import bcrypt from 'bcryptjs';

const userController = {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.session.userId).select('-password');
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const { firstname, lastname, email, password, avatar } = req.body;
      const user = await User.findById(req.session.userId);

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      if (firstname) user.firstname = firstname;
      if (lastname) user.lastname = lastname;
      if (email) user.email = email;
      if (avatar !== undefined) user.avatar = avatar;
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();
      res.json({ success: true, user: { ...user.toObject(), password: undefined } });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err.message });
    }
  },

  async searchUsers(req, res) {
    try {
      const { q } = req.query;
      // Exclure l'utilisateur courant des résultats
      const users = await User.find({
        _id: { $ne: req.session.userId },
        $or: [
          { firstname: new RegExp(q, 'i') },
          { lastname: new RegExp(q, 'i') },
          { email: new RegExp(q, 'i') }
        ]
      }).select('-password').limit(10);
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  }
};

export default userController;