import Post from '../models/post.js';

const postController = {
  async getAllPosts(req, res) {
    try {
      const posts = await Post.find()
        .populate('author', 'firstname lastname avatar')
        .populate('answers.author', 'firstname lastname avatar')
        .sort({ creationDate: -1 });
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async createPost(req, res) {
    try {
      const { message, image } = req.body;
      const post = new Post({
        author: req.session.userId,
        message,
        image
      });
      await post.save();
      await post.populate('author', 'firstname lastname avatar');
      res.json({ success: true, post });
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  },

  async createAnswer(req, res) {
    try {
      const { postId } = req.params;
      const { message, image, parentAnswerId } = req.body;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post introuvable' });
      }

      const answer = {
        author: req.session.userId,
        message,
        image,
        answers: []
      };

      // Si c'est une réponse à une réponse
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
      await post.populate('author', 'firstname lastname avatar');
      await post.populate('answers.author', 'firstname lastname avatar');
      res.json({ success: true, post });
    } catch (err) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  }
};

export default postController;