import Group from '../models/group.js';
import GroupPost from '../models/groupPost.js';

const groupController = {
  async getAllGroups(req, res) {
    try {
      // Retourner seulement les groupes de l'utilisateur
      const groups = await Group.find({ users: req.session.userId })
        .populate('createdBy', 'firstname lastname')
        .populate('users', 'firstname lastname avatar email');
      res.json(groups);
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async createGroup(req, res) {
    try {
      const { name, users } = req.body;
      
      // Filtrer les utilisateurs pour exclure l'utilisateur courant
      const filteredUsers = (users || []).filter(id => id !== req.session.userId.toString());
      
      const group = new Group({
        name,
        users: filteredUsers,
        createdBy: req.session.userId
      });
      
      // Ajouter le créateur
      group.users.push(req.session.userId);
      
      await group.save();
      await group.populate('createdBy', 'firstname lastname');
      await group.populate('users', 'firstname lastname avatar email');
      res.json({ success: true, group });
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async getGroup(req, res) {
    try {
      const group = await Group.findById(req.params.groupId)
        .populate('createdBy', 'firstname lastname')
        .populate('users', 'firstname lastname avatar email');
      
      if (!group) {
        return res.status(404).json({ message: 'Groupe introuvable' });
      }

      // Vérifier que l'utilisateur fait partie du groupe
      if (!group.users.some(u => u._id.toString() === req.session.userId.toString())) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      res.json(group);
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async addMembersToGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { userIds } = req.body;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe introuvable' });
      }

      // Vérifier que l'utilisateur est le créateur du groupe
      if (group.createdBy.toString() !== req.session.userId.toString()) {
        return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à ajouter des membres' });
      }

      // Ajouter les utilisateurs qui ne sont pas déjà dans le groupe
      const newUserIds = userIds.filter(id => 
        !group.users.some(u => u.toString() === id.toString())
      );

      group.users.push(...newUserIds);
      await group.save();
      await group.populate('createdBy', 'firstname lastname');
      await group.populate('users', 'firstname lastname avatar email');
      
      res.json({ success: true, group });
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async createGroupPost(req, res) {
    try {
      const { groupId } = req.params;
      const { message, image } = req.body;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe introuvable' });
      }

      if (!group.users.some(u => u.toString() === req.session.userId.toString())) {
        return res.status(403).json({ message: 'Vous ne faites pas partie de ce groupe' });
      }

      const post = new GroupPost({
        group: groupId,
        user: req.session.userId,
        message,
        image
      });
      await post.save();
      await post.populate('user', 'firstname lastname avatar');
      res.json({ success: true, post });
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async getGroupPosts(req, res) {
    try {
      const { groupId } = req.params;
      
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe introuvable' });
      }

      if (!group.users.some(u => u.toString() === req.session.userId.toString())) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const posts = await GroupPost.find({ group: groupId })
        .populate('user', 'firstname lastname avatar')
        .populate('answers.user', 'firstname lastname avatar')
        .sort({ createdAt: -1 });
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async createGroupAnswer(req, res) {
    try {
      const { groupId, postId } = req.params;
      const { message, image, parentAnswerId } = req.body;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe introuvable' });
      }

      if (!group.users.some(u => u.toString() === req.session.userId.toString())) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const post = await GroupPost.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post introuvable' });
      }

      const answer = {
        user: req.session.userId,
        message,
        image,
        answers: []
      };

      if (parentAnswerId) {
        const findAndAddAnswer = (answers) => {
          for (let a of answers) {
            if (a._id.toString() === parentAnswerId) {
              a.answers.push(answer);
              return true;
            }
            if (a.answers && a.answers.length > 0) {
              if (findAndAddAnswer(a.answers)) return true;
            }
          }
          return false;
        };
        findAndAddAnswer(post.answers);
      } else {
        post.answers.push(answer);
      }

      await post.save();
      await post.populate('user', 'firstname lastname avatar');
      await post.populate('answers.user', 'firstname lastname avatar');
      res.json({ success: true, post });
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  }
};

export default groupController;