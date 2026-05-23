// js/app.js
// Load student data and handle search functionality

// Helper to compute SHA-256 hash of a string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Search handler attached to form submission
async function handleSearch(event) {
  event.preventDefault();
  const input = document.getElementById('search-input');
  const noPeserta = input.value.trim();

  if (!noPeserta) {
    showError('Input Kosong', 'Masukkan No. Peserta terlebih dahulu.');
    return;
  }

  // Disable search button to prevent double-click
  const searchBtn = document.getElementById('btn-search');
  if (searchBtn) searchBtn.disabled = true;

  try {
    // Hash the participant number
    const hash = await sha256(noPeserta);

    // Fetch the individual student file
    const response = await fetch(`./data/${hash}.json`);
    if (!response.ok) {
      if (response.status === 404) {
        showError('Data Tidak Ditemukan', 'Nomor peserta yang Anda masukkan tidak terdaftar. Silakan periksa kembali.');
      } else {
        showError('Terjadi Kesalahan', 'Gagal mengambil data dari server. Silakan coba lagi nanti.');
      }
      return;
    }

    const student = await response.json();

    // Populate modal fields
    document.getElementById('modal-no-peserta').textContent = student.no_peserta;
    document.getElementById('modal-nisn').textContent = student.nisn;
    document.getElementById('modal-nama').textContent = student.nama.toUpperCase();
    document.getElementById('modal-jk').textContent = student.jk === 'L' ? 'Laki-laki' : 'Perempuan';
    document.getElementById('modal-keterangan').textContent = student.keterangan;
    document.getElementById('modal-rata').textContent = student.rata_rata.toFixed(1);

    const statusBanner = document.getElementById('status-banner');

    if (student.keterangan === 'LULUS') {
      statusBanner.className = 'status-banner lulus';
      statusBanner.innerHTML = '<i class="fas fa-check-circle"></i> SELAMAT! ANDA DINYATAKAN LULUS';
    } else {
      statusBanner.className = 'status-banner tidak-lulus';
      statusBanner.innerHTML = '<i class="fas fa-times-circle"></i> MAAF, ANDA DINYATAKAN TIDAK LULUS';
    }

    // Show modal
    document.getElementById('result-modal').classList.add('active');
  } catch (err) {
    console.error(err);
    showError('Kesalahan Sistem', 'Terjadi kesalahan saat memproses data.');
  } finally {
    if (searchBtn) searchBtn.disabled = false;
  }
}

function closeModal() {
  // Hide modal and reset form
  document.getElementById('result-modal').classList.remove('active');
  document.getElementById('search-form').reset();
}

// Error modal functions
function showError(title, message) {
  document.getElementById('error-title').textContent = title;
  document.getElementById('error-message').textContent = message;
  document.getElementById('error-modal').classList.add('active');
}

function closeErrorModal() {
  document.getElementById('error-modal').classList.remove('active');
}

// Close modals on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.id === 'result-modal') {
    closeModal();
  }
  if (e.target.id === 'error-modal') {
    closeErrorModal();
  }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeErrorModal();
  }
});

// Export functions to global scope for inline HTML event handlers
window.handleSearch = handleSearch;
window.closeModal = closeModal;
window.closeErrorModal = closeErrorModal;
window.showError = showError;
