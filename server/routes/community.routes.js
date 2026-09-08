const express = require('express');
const db = require('../database/connection');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

function sanitizePost(post) {
  if (!post) return null;
  return {
    ...post,
    foodRecipe: typeof post.food_recipe_json === 'string' ? JSON.parse(post.food_recipe_json || '{}') : (post.food_recipe_json || {}),
    comments: typeof post.comments_json === 'string' ? JSON.parse(post.comments_json || '[]') : (post.comments_json || [])
  };
}

/**
 * GET /api/community/posts
 */
router.get('/posts', async (req, res) => {
  try {
    const { category, limit } = req.query;
    let sql = 'SELECT * FROM community_posts WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    const limitVal = parseInt(limit) || 30;
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limitVal);

    const rawPosts = await db.query(sql, params);
    const posts = rawPosts.map(sanitizePost);

    return res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (err) {
    console.error('Get community posts error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/community/posts
 */
router.post('/posts', optionalAuth, async (req, res) => {
  try {
    const { title, content, category, foodRecipe, authorName, authorBadge } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Judul dan isi cerita pemulihan wajib diisi.' });
    }

    const userId = req.user ? req.user.id : (req.body.userId || 'usr_patient_siti');
    const postId = 'post_' + Date.now();
    const finalAuthor = authorName || (req.user ? req.user.name : 'Pasien NutriVision');
    const finalBadge = authorBadge || 'Pasien Pemulihan';

    await db.run(`
      INSERT INTO community_posts (
        id, user_id, author_name, author_badge, category, title, content,
        food_recipe_json, likes_count, comments_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, '[]')
    `, [
      postId,
      userId,
      finalAuthor,
      finalBadge,
      category || 'sharing',
      title.trim(),
      content.trim(),
      JSON.stringify(foodRecipe || {})
    ]);

    const created = await db.get('SELECT * FROM community_posts WHERE id = ?', [postId]);
    return res.status(201).json({
      success: true,
      message: 'Cerita pemulihan Anda berhasil dibagikan ke komunitas!',
      post: sanitizePost(created)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/community/posts/:id/like
 */
router.post('/posts/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await db.get('SELECT * FROM community_posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan.' });
    }

    const newLikes = (post.likes_count || 0) + 1;
    await db.run('UPDATE community_posts SET likes_count = ? WHERE id = ?', [newLikes, postId]);

    return res.json({ success: true, likesCount: newLikes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/community/posts/:id/comment
 */
router.post('/posts/:id/comment', optionalAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { text, authorName } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Komentar tidak boleh kosong.' });
    }

    const post = await db.get('SELECT * FROM community_posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan.' });
    }

    const comments = typeof post.comments_json === 'string' ? JSON.parse(post.comments_json || '[]') : (post.comments_json || []);
    const newComment = {
      id: 'c_' + Date.now(),
      author: authorName || (req.user ? req.user.name : 'Anggota Komunitas'),
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);

    await db.run('UPDATE community_posts SET comments_json = ? WHERE id = ?', [JSON.stringify(comments), postId]);

    return res.status(201).json({ success: true, message: 'Komentar berhasil dikirim!', comment: newComment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
