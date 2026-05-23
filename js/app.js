// Cache map for fetched student data
const studentCache = new Map();

// Helper to show/hide loading spinner (requires #loader element in HTML)
function setLoading(show) {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.toggle('hidden', !show);
}

// Existing SHA-256 helper remains unchanged
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Enhanced search handler
async function handleSearch(event) {
  event.preventDefault();
  const input = document.getElementById('search-input');
  const noPeserta = input.value.trim();

  // Input validation: must be at least 3 digits
  if (!/^\d{3,}$/.test(noPeserta)) {
    showError('Input Tidak Valid', 'Nomor peserta harus berupa angka minimal 3 digit.');
    return;
  }

  const searchBtn = document.getElementById('btn-search');
  if (searchBtn) searchBtn.disabled = true;
  setLoading(true);

  try {
    const hash = await sha256(noPeserta);
    // Check cache first
    let student = studentCache.get(hash);
    if (!student) {
      const response = await fetch(`./data/${hash}.json`);
      if (!response.ok) {
        if (response.status === 404) {
          showError('Data Tidak Ditemukan', 'Nomor peserta yang Anda masukkan tidak terdaftar.');
        } else {
          showError('Kesalahan Server', 'Gagal mengambil data dari server.');
        }
        return;
      }
      student = await response.json();
      studentCache.set(hash, student);
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

    document.getElementById('result-modal').classList.add('active');
  } catch (err) {
    console.error(err);
    showError('Kesalahan Sistem', 'Terjadi kesalahan saat memproses data.');
  } finally {
    setLoading(false);
    if (searchBtn) searchBtn.disabled = false;
  }
}

// Rest of the file remains unchanged (closeModal, error handling, exports)
