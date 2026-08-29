// NutriVision AI — Ruang Komunitas Pemulihan
// Sesuai FR-13: Berbagi tips, pengalaman kondisi fisik, verifikasi gizi dasar

class NutriVisionCommunity {
  constructor() {
    this.posts = JSON.parse(localStorage.getItem('nutrivision_community_posts')) || NUTRIVISION_DATA.initialCommunityPosts;
    this.activeFilter = 'all';
  }

  setFilter(category) {
    this.activeFilter = category;
    this.renderCommunityFeed();
  }

  // Tambah Postingan Baru dengan Pengecekan Gizi Dasar
  createPost(author, conditionCategory, categoryLabel, contentText) {
    if (!contentText || contentText.trim().length < 10) {
      alert('Mohon tuliskan tips/pengalaman minimal 10 karakter.');
      return false;
    }

    // Pengecekan gizi dasar: Tandai terverifikasi jika menyebutkan bahan bergizi atau trik pemulihan
    const nutritionKeywords = ['protein', 'telur', 'ayam', 'tahu', 'tempe', 'ikan', 'sayur', 'sup', 'serat', 'kalori', 'gabus', 'rebus', 'kukus'];
    const isBasicNutritionVerified = nutritionKeywords.some(kw => contentText.toLowerCase().includes(kw));

    const initials = author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

    const newPost = {
      id: 'comm-' + Date.now(),
      author: author || 'Pengguna NutriVision',
      initials: initials,
      category: conditionCategory,
      categoryLabel: categoryLabel || 'Komunitas Pemulihan',
      timeAgo: 'Baru saja',
      verified: isBasicNutritionVerified,
      text: contentText.trim(),
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
  }

  addComment(postId, commentText, author = 'Rangga P.') {
    if (!commentText || commentText.trim().length === 0) return;
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.comments.push({
      author: author,
      text: commentText.trim()
    });

    this.savePosts();
    this.renderCommunityFeed();
  }

  savePosts() {
    localStorage.setItem('nutrivision_community_posts', JSON.stringify(this.posts));
  }

  renderCommunityFeed() {
    const container1 = document.getElementById('community-feed-box');
    const container2 = document.getElementById('community-feed-box-full');
    if (!container1 && !container2) return;

    const filtered = (this.activeFilter === 'all')
      ? this.posts
      : this.posts.filter(p => p.category === this.activeFilter);

    if (filtered.length === 0) {
      const emptyHtml = `<div style="text-align:center;padding:24px;color:var(--ink-mute);">Belum ada tips pada kategori ini. Jadilah yang pertama berbagi!</div>`;
      if (container1) container1.innerHTML = emptyHtml;
      if (container2) container2.innerHTML = emptyHtml;
      return;
    }

    const html = filtered.map(post => {
      return `
        <div class="community-post">
          <div class="comm-avatar">${post.initials}</div>
          <div class="comm-content">
            <div class="comm-header">
              <span class="comm-author">${post.author}</span>
              <span class="comm-condition-tag">${post.categoryLabel}</span>
              <span style="font-size:11px;color:var(--ink-mute);margin-left:auto;">${post.timeAgo}</span>
            </div>
            
            <p class="comm-text">${post.text}</p>
            
            ${post.verified ? `
              <div class="comm-verified-badge">
                <span>🛡️</span> Lolos verifikasi gizi dasar sistem
              </div>
            ` : ''}

            <div class="comm-actions">
              <button class="comm-action-btn ${post.userLiked ? 'liked' : ''}" onclick="communityHandler.toggleLike('${post.id}')">
                <span>${post.userLiked ? '❤️' : '🤍'}</span> <b>${post.likes}</b> Suka
              </button>
              <button class="comm-action-btn" onclick="communityHandler.promptComment('${post.id}')">
                <span>💬</span> <b>${post.comments ? post.comments.length : 0}</b> Komentar
              </button>
            </div>

            ${post.comments && post.comments.length > 0 ? `
              <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);font-size:12px;">
                ${post.comments.map(c => `
                  <div style="margin-top:4px;"><b style="color:var(--teal-900);">${c.author}:</b> <span style="color:var(--ink-soft);">${c.text}</span></div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (container1) container1.innerHTML = html;
    if (container2) container2.innerHTML = html;
  }

  promptComment(postId) {
    const text = prompt('Tulis komentar tanggapanmu:');
    if (text) {
      this.addComment(postId, text);
    }
  }
}

const communityHandler = new NutriVisionCommunity();
