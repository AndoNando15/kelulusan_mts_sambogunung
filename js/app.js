// js/app.js
// Load student data and handle search functionality

let studentData = [];

// Load data on window load
window.addEventListener('load', async () => {
  await loadStudentData();
});

async function loadStudentData() {
  try {
    const response = await fetch('./data/database.json');
    if (!response.ok) {
      throw new Error('Failed to load student data');
    }
    studentData = await response.json();
  } catch (err) {
    console.error(err);
    showError('Gagal Memuat Data', 'Tidak dapat memuat data siswa. Silakan muat ulang halaman.');
  }
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

  const student = studentData.find(s => s.no_peserta === noPeserta);

  if (!student) {
    showError('Data Tidak Ditemukan', 'Nomor peserta yang Anda masukkan tidak terdaftar. Silakan periksa kembali.');
    return;
  }

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
