// NutriVision AI — Ruang Komunitas Pemulihan
// Sesuai FR-13: Berbagi tips, pengalaman kondisi fisik, verifikasi gizi dasar

class NutriVisionCommunity {
  constructor() {
    this.activeFilter = 'all';
    this.loadPosts();
  }

  loadPosts() {
    const initPosts = (typeof NUTRIVISION_DATA !== 'undefined' && NUTRIVISION_DATA.initialCommunityPosts && NUTRIVISION_DATA.initialCommunityPosts.length > 0) 
      ? NUTRIVISION_DATA.initialCommunityPosts 
      : [];
      
    const saved = localStorage.getItem('nutrivision_community_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.posts = parsed.map(p => {
          const init = initPosts.find(i => i.id === p.id);
          if (init) {
            return {
              ...init,
              likes: p.likes !== undefined ? p.likes : init.likes,
              userLiked: p.userLiked || false,
              comments: p.comments && p.comments.length > 0 ? p.comments : init.comments
            };
          }
          return p;
        });
      } catch (e) {
        this.posts = [...initPosts];
      }
    } else {
      this.posts = [...initPosts];
    }
  }

  setFilter(category) {
    this.activeFilter = category;
    this.renderCommunityFeed();
  }

  // Tambah Postingan Baru dengan Pengecekan Gizi Safetensors AI Model
  async createPost(author, conditionCategory, categoryLabel, contentText) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    if (!contentText || contentText.trim().length < 10) {
      alert(isId ? 'Mohon tuliskan tips/pengalaman minimal 10 karakter.' : 'Please write tips/experience of at least 10 characters.');
      return false;
    }

    // Pengecekan gizi dasar: Tandai terverifikasi jika menyebutkan bahan bergizi atau trik pemulihan
    const nutritionKeywords = [
      'protein', 'telur', 'ayam', 'tahu', 'tempe', 'ikan', 'sayur', 'sup', 'serat', 'kalori', 'gabus', 'rebus', 'kukus',
      'egg', 'chicken', 'fish', 'meat', 'beef', 'salad', 'salmon', 'mackerel', 'veggie', 'vegetable', 'broth'
    ];
    let isBasicNutritionVerified = nutritionKeywords.some(kw => contentText.toLowerCase().includes(kw));
    let aiClass = null;
    let aiAnalysis = null;
    let aiConfidence = null;
    let aiAdvice = null;

    // Call NutriVision AI Backend Safetensors Model if available
    if (window.nutriAPI && typeof window.nutriAPI.classifyNutritionText === 'function') {
      try {
        const aiRes = await window.nutriAPI.classifyNutritionText(contentText);
        if (aiRes && aiRes.success && aiRes.result) {
          aiClass = aiRes.result.predictedClass;
          aiAnalysis = aiRes.result.name;
          aiConfidence = aiRes.result.confidence;
          aiAdvice = aiRes.result.clinicalAdvice;
          if (aiClass === 0) {
            isBasicNutritionVerified = true;
          }
        }
      } catch (err) {
        console.warn('AI classification request fallback:', err);
      }
    }

    const initials = author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

    const newPost = {
      id: 'comm-' + Date.now(),
      author: author || (isId ? 'Pengguna NutriVision' : 'NutriVision User'),
      initials: initials,
      category: conditionCategory,
      categoryLabel: categoryLabel || (isId ? 'Komunitas Pemulihan' : 'Recovery Community'),
      categoryLabelEn: categoryLabel || 'Recovery Community',
      timeAgo: isId ? 'Baru saja' : 'Just now',
      timeAgoEn: 'Just now',
      verified: isBasicNutritionVerified,
      aiClass: aiClass,
      aiAnalysis: aiAnalysis,
      aiConfidence: aiConfidence,
      aiAdvice: aiAdvice,
      text: contentText.trim(),
      textEn: contentText.trim(),
      likes: 0,
      userLiked: false,
      comments: []
    };

    this.posts.unshift(newPost);
    this.savePosts();
    this.renderCommunityFeed();
    return true;
  }

  toggleLike(postId) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    app.requireAuth(() => {
      const post = this.posts.find(p => p.id === postId);
      if (!post) return;

      if (post.userLiked) {
        post.likes = Math.max(0, post.likes - 1);
        post.userLiked = false;
      } else {
        post.likes += 1;
        post.userLiked = true;
      }

      this.savePosts();
      this.renderCommunityFeed();
    }, isId ? 'menyukai postingan' : 'liking this post');
  }

  addComment(postId, commentText, author) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    app.requireAuth(() => {
      if (!commentText || commentText.trim().length === 0) return;
      const post = this.posts.find(p => p.id === postId);
      if (!post) return;

      const commenterName = author || app.userProfile.name || (isId ? 'Pengguna NutriVision' : 'NutriVision User');
      post.comments.push({
        author: commenterName,
        text: commentText.trim(),
        textEn: commentText.trim()
      });

      this.savePosts();
      this.renderCommunityFeed();
      app.showToast(isId ? 'Komentar berhasil ditambahkan!' : 'Comment successfully posted!');
    }, isId ? 'menulis komentar' : 'posting a comment');
  }

  savePosts() {
    localStorage.setItem('nutrivision_community_posts', JSON.stringify(this.posts));
  }

  renderCommunityFeed() {
    const container1 = document.getElementById('community-feed-box');
    const container2 = document.getElementById('community-feed-box-full');
    if (!container1 && !container2) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';

    const filtered = (this.activeFilter === 'all')
      ? this.posts
      : this.posts.filter(p => p.category === this.activeFilter);

    const renderPostItem = (post, isFullView = false) => {
      let categoryLabel = isId ? post.categoryLabel : (post.categoryLabelEn || post.categoryLabel);
      if (!isId && categoryLabel) {
        categoryLabel = categoryLabel
          .replace('Pasca-Bedah Digestif · Mg 2', 'Digestive Post-Surgery · Wk 2')
          .replace('Gym Recovery & Hipertrofi', 'Gym Recovery & Hypertrophy')
          .replace('Fisioterapi & Rehabilitasi ACL', 'Physiotherapy & ACL Rehab')
          .replace('Komunitas Pemulihan', 'Recovery Community');
      }

      let timeAgo = isId ? post.timeAgo : (post.timeAgoEn || post.timeAgo);
      if (!isId && timeAgo) {
        timeAgo = timeAgo
          .replace('jam yang lalu', 'hours ago')
          .replace('hari yang lalu', 'day ago')
          .replace('menit yang lalu', 'minutes ago')
          .replace('Baru saja', 'Just now');
      }

      const postText = isId ? post.text : (post.textEn || post.text);
      const verifiedBadgeText = isId ? 'Lolos verifikasi gizi dasar sistem' : 'System verified clinical recovery nutrition';
      const likesLabel = isId ? 'Suka' : 'Likes';
      const commentsLabel = isId ? 'Komentar' : 'Comments';

      return `
        <div class="community-post">
          <div class="comm-avatar">${post.initials}</div>
          <div class="comm-content">
            <div class="comm-header">
              <span class="comm-author">${post.author}</span>
              <span class="comm-condition-tag">${categoryLabel}</span>
              <span style="font-size:11px;color:var(--ink-mute);margin-left:auto;">${timeAgo}</span>
            </div>
            
            <p class="comm-text">${postText}</p>
            
            ${post.aiAnalysis ? `
              <div class="comm-verified-badge" style="background:${post.aiClass === 2 ? 'rgba(216,90,48,0.1)' : (post.aiClass === 1 ? 'rgba(239,159,39,0.12)' : 'rgba(63,190,147,0.12)')};color:${post.aiClass === 2 ? '#D85A30' : (post.aiClass === 1 ? '#D97706' : 'var(--teal-700)')};border:1px solid ${post.aiClass === 2 ? 'rgba(216,90,48,0.25)' : (post.aiClass === 1 ? 'rgba(239,159,39,0.25)' : 'rgba(63,190,147,0.25)')};display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;margin-top:6px;font-size:11.5px;">
                <i data-lucide="${post.aiClass === 2 ? 'alert-triangle' : (post.aiClass === 1 ? 'info' : 'sparkles')}" class="btn-icon-sm"></i>
                <span><strong>AI Safetensors (${post.aiConfidence}%):</strong> ${post.aiAnalysis}</span>
              </div>
            ` : (post.verified ? `
              <div class="comm-verified-badge">
                <i data-lucide="shield-check" class="btn-icon-sm"></i> ${verifiedBadgeText}
              </div>
            ` : '')}

            <div class="comm-actions">
              <button class="comm-action-btn ${post.userLiked ? 'liked' : ''}" onclick="communityHandler.toggleLike('${post.id}')">
                <i data-lucide="heart" class="btn-icon-sm" style="${post.userLiked ? 'fill:var(--coral-400);stroke:var(--coral-400);' : ''}"></i> <b>${post.likes}</b> ${likesLabel}
              </button>
              ${isFullView ? `
                <button class="comm-action-btn" onclick="const f = document.getElementById('comm-comm-${post.id}'); if(f) f.style.display = f.style.display==='none'?'block':'none';">
                  <i data-lucide="message-circle" class="btn-icon-sm"></i> <b>${post.comments?.length || 0}</b> ${commentsLabel}
                </button>
              ` : ''}
            </div>

            ${isFullView && post.comments && post.comments.length > 0 ? `
              <div class="comm-comments-list" style="margin-top:10px;padding:8px 12px;background:var(--bg);border-radius:var(--radius-xs);border:1px solid var(--line);">
                ${post.comments.map(c => `
                  <div style="margin-top:4px;"><b style="color:var(--teal-900);">${c.author}:</b> <span style="color:var(--ink-soft);">${isId ? c.text : (c.textEn || c.text)}</span></div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    };

    if (container1) {
      container1.innerHTML = filtered.slice(0, 3).map(p => renderPostItem(p, false)).join('');
    }
    if (container2) {
      container2.innerHTML = filtered.map(p => renderPostItem(p, true)).join('');
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  promptComment(postId) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const text = prompt(isId ? 'Tulis komentar tanggapanmu:' : 'Write your reply comment:');
    if (text) {
      this.addComment(postId, text);
    }
  }
}

const communityHandler = new NutriVisionCommunity();

