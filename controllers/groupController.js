import Group from '../models/group.js';
import GroupPost from '../models/groupPost.js';

const groupController = {
  async getAllGroups(req, res) {
    try {
      const groups = await Group.find()
        .populate('createdBy', 'firstname lastname')
        .populate('users', 'firstname lastname avatar');
      res.json(groups);
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async createGroup(req, res) {
    try {
      const { name, users } = req.body;
      const group = new Group({
        name,
        users: users || [],
        createdBy: req.session.userId
      });
      group.users.push(req.session.userId); // Ajouter le créateur
      await group.save();
      await group.populate('createdBy', 'firstname lastname');
      await group.populate('users', 'firstname lastname avatar');
      res.json({ success: true, group });
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async getGroup(req, res) {
    try {
      const group = await Group.findById(req.params.groupId)
        .populate('createdBy', 'firstname lastname')
        .populate('users', 'firstname lastname avatar');
      if (!group) {
        return res.status(404).json({ message: 'Groupe introuvable' });
      }
      res.json(group);
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

      // Vérifier que l'utilisateur fait partie du groupe
      if (!group.users.includes(req.session.userId)) {
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
      const posts = await GroupPost.find({ group: req.params.groupId })
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