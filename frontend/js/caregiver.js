// NutriVision AI — Portal Pendamping (Caregiver View — View-Only)
// Akses lihat-saja terproteksi untuk keluarga pendamping pasien

class NutriVisionCaregiver {
  constructor() {
    this.caregivers = [
      {
        id: 'cg-1',
        name: 'Ibu Maria (Ibu Kandung)',
        nameEn: 'Maria (Biological Mother)',
        role: 'Keluarga Pendamping',
        roleEn: 'Family Caregiver',
        initials: 'IM',
        hasAccess: true,
        lastSeen: '15 menit yang lalu',
        lastSeenEn: '15 minutes ago'
      }
    ];
  }

  toggleAccess(caregiverId, isEnabled) {
    const cg = this.caregivers.find(c => c.id === caregiverId);
    if (cg) {
      cg.hasAccess = isEnabled;
    }
  }

  generateSharedLink() {
    const token = Math.random().toString(36).substring(2, 9).toUpperCase();
    const patientSlug = (typeof app !== 'undefined' && app.userProfile && app.userProfile.name)
      ? encodeURIComponent(app.userProfile.name.toLowerCase().replace(/\s+/g, '-'))
      : 'pasien';
    return `https://nutrivision.ai/view?patient=${patientSlug}&token=NV-${token}`;
  }

  renderCaregiverList() {
    const container1 = document.getElementById('caregiver-list-box');
    const container2 = document.getElementById('caregiver-list-box-full');
    if (!container1 && !container2) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';

    const html = this.caregivers.map(cg => {
      const displayName = isId ? cg.name : (cg.nameEn || cg.name);
      const displayRole = isId ? cg.role : (cg.roleEn || cg.role);
      const lastActiveLabel = isId ? 'Terakhir aktif:' : 'Last active:';
      const displayLastSeen = isId ? cg.lastSeen : (cg.lastSeenEn || cg.lastSeen);

      return `
        <div class="caregiver-row">
          <div class="caregiver-avatar">${cg.initials}</div>
          <div class="caregiver-details">
            <b>${displayName}</b>
            <span>${displayRole} · ${lastActiveLabel} ${displayLastSeen}</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${cg.hasAccess ? 'checked' : ''} onchange="caregiverHandler.toggleAccess('${cg.id}', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      `;
    }).join('');

    if (container1) container1.innerHTML = html;
    if (container2) container2.innerHTML = html;
  }
}

const caregiverHandler = new NutriVisionCaregiver();
if (typeof window !== 'undefined') {
  window.caregiverHandler = caregiverHandler;
}

