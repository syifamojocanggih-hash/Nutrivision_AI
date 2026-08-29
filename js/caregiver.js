// NutriVision AI — Portal Pendamping (Caregiver View — View-Only)
// Sesuai FR-12: Akses lihat-saja untuk keluarga/tenaga medis pendamping

class NutriVisionCaregiver {
  constructor() {
    this.caregivers = [
      {
        id: 'cg-1',
        name: 'Ibu Maria (Ibu Kandung)',
        role: 'Keluarga Pendamping',
        initials: 'IM',
        hasAccess: true,
        lastSeen: '15 menit yang lalu'
      },
      {
        id: 'cg-2',
        name: 'dr. Hendra (Sp.KFR)',
        role: 'Dokter / Fisioterapis',
        initials: 'DH',
        hasAccess: true,
        lastSeen: 'Kemarin, 16:30'
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
    return `https://nutrivision.ai/view?patient=rangga&token=NV-${token}`;
  }

  renderCaregiverList() {
    const container1 = document.getElementById('caregiver-list-box');
    const container2 = document.getElementById('caregiver-list-box-full');
    if (!container1 && !container2) return;

    const html = this.caregivers.map(cg => {
      return `
        <div class="caregiver-row">
          <div class="caregiver-avatar">${cg.initials}</div>
          <div class="caregiver-details">
            <b>${cg.name}</b>
            <span>${cg.role} · Terakhir aktif: ${cg.lastSeen}</span>
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
