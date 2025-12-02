pagemodule = 'Contact';
colSpanCount = 9;
setDataType('client');

if (window.detail_id && window.detail_desc) {
  // Mode update
  loadDetail(detail_id, detail_desc);
  document.getElementById('addButton').classList.add('hidden');
}else {
  // Mode tambah
  document.getElementById('updateButton').classList.add('hidden');
  // loadDropdown('formCategory', `${baseUrl}/list/product_category/${owner_id}`, 'category_id', 'category');
  // loadDropdown('formUnit', `${baseUrl}/list/product_unit/${owner_id}`, 'unit_id', 'unit');
  // loadDropdown('formStatus', `${baseUrl}/list/product_status/${owner_id}`, 'status_id', 'status');
  loadKategoriOptions();
  
  formattedToday = today.getFullYear() + '-' +
  String(today.getMonth() + 1).padStart(2, '0') + '-' +
  String(today.getDate()).padStart(2, '0');
  console.log(formattedToday);
  document.getElementById('formJoin').value = formattedToday;
}

function switchTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

  // Remove active styling
  document.querySelectorAll('.tab-link').forEach(btn => {
    btn.classList.remove('bg-blue-100', 'text-blue-600', 'font-semibold');
    btn.classList.add('text-gray-600');
  });

  // Show selected tab
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');

  // Set active tab link
  document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('bg-blue-100', 'text-blue-600', 'font-semibold');
  document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.remove('text-gray-600');
}

async function loadDropdown(selectId, apiUrl, valueField, labelField) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">Loading...</option>`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log(`Data untuk ${selectId}:`, result);
    const listData = result.listData;

    select.innerHTML = `<option value="">Pilih...</option>`;

    if (Array.isArray(listData)) {
      listData.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[labelField];
        select.appendChild(option);
      });
    } else {
      console.error('Format listData tidak sesuai:', listData);
    }

  } catch (error) {
    console.error(`Gagal memuat data untuk ${selectId}:`, error);
    select.innerHTML = `<option value="">Gagal memuat data</option>`;
  }
}

 async function loadDetail(Id, Detail) {
    document.getElementById('formTitle').innerText = `FORM UPDATE PELANGGAN`;
    window.detail_id = Id;
    window.detail_desc = Detail;

    fetch(`${baseUrl}/detail/client/${Id}?_=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`
      }
    })
    .then(res => res.json())
    .then(async ({ detail }) => {
      console.log(detail);
      const pelangganId = detail.pelanggan_id;
      document.getElementById('formID').value = pelangganId ? `CUS-${pelangganId.toString().padStart(5, '0')}` : '';
      // document.getElementById('formID').value = `${detail.pelanggan_id}` || '';
      document.getElementById('formJoin').value = detail.join_date || '';
      document.getElementById('formNama').value = detail.nama || '';
      document.getElementById('formAlias').value = detail.alias || '';
      document.getElementById('formPhone').value = String(detail.whatsapp || '');
      document.getElementById('formEmail').value = detail.email || '';
      document.getElementById('formNIK').value = String(detail.nik || '');
      document.getElementById('formNpwp').value = String(detail.no_npwp || '');
      document.getElementById('formBirth').value = detail.birth || '';
      document.getElementById('formWeb').value = detail.website || '';
      document.getElementById('formAlamat').value = detail.alamat || '';
      document.getElementById('cityInput').value = detail.region_name || '';
      document.getElementById('formKelurahan').value = detail.kelurahan || '';
      document.getElementById('formKecamatan').value = detail.kecamatan || '';
      document.getElementById('formKota').value = detail.kota || '';
      document.getElementById('formProvinsi').value = detail.provinsi || '';
      document.getElementById('formPOS').value = detail.kode_pos || '';
      document.getElementById('formregion_ID').value = detail.region_id || '';

      // Ambil array business_category_id dari detail.business_categories
      let selectedBusinessCategories = (detail.business_categories || []).map(cat => cat.business_category_id);

      console.log('Selected Category IDs:', selectedBusinessCategories);

      // Load dan centang checkbox kategori yang sesuai
      await loadKategoriOptions(Id, selectedBusinessCategories);
    })
    .catch(err => console.error('Gagal load detail:', err));
  }

async function loadKategoriOptions(Id, selectedIds = []) {
  try {
    const res = await fetch(`${baseUrl}/list/business_category/${owner_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    const result = await res.json();
    const kategoriList = result.listData || [];

    const container = document.getElementById('kategoriList');
    const countDisplay = document.getElementById('selectedCount');
    const searchInput = document.getElementById('searchKategori');

    container.innerHTML = '';
    countDisplay.textContent = `0 kategori dipilih`;

    // Pisahkan yang terpilih dan tidak terpilih
    const selectedItems = kategoriList.filter(item => selectedIds.includes(item.business_category_id));
    const unselectedItems = kategoriList.filter(item => !selectedIds.includes(item.business_category_id));
    const sortedList = [...selectedItems, ...unselectedItems];

    sortedList.forEach(item => {
      const checkboxWrapper = document.createElement('label');
      checkboxWrapper.className = "flex items-start gap-2 p-2 border rounded hover:bg-gray-100 kategori-item";

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'kategori';
      checkbox.value = item.business_category_id;
      checkbox.className = 'mt-1';

      // Jika termasuk yang dipilih
      if (selectedIds.includes(item.business_category_id)) {
        checkbox.checked = true;
        checkboxWrapper.classList.add('bg-green-100'); // Warna hijau
      }

      const labelText = document.createElement('div');
      labelText.innerHTML = `<strong>${item.business_category}</strong><br><small>${item.description || ''}</small>`;

      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(labelText);
      container.appendChild(checkboxWrapper);

      checkbox.addEventListener('change', () => updateSelectedCount());

      checkboxWrapper.dataset.category = `${item.business_category} ${item.description || ''}`.toLowerCase();
    });

    function updateSelectedCount() {
      const selected = container.querySelectorAll('input[name="kategori"]:checked').length;
      countDisplay.textContent = `${selected} kategori dipilih`;
    }

    // Inisialisasi count awal
    updateSelectedCount();

    // Pencarian
    searchInput.addEventListener('input', function () {
      const keyword = this.value.toLowerCase();
      const items = container.querySelectorAll('.kategori-item');

      items.forEach(item => {
        const text = item.dataset.category;
        item.style.display = text.includes(keyword) ? 'flex' : 'none';
      });
    });

  } catch (err) {
    console.error('Gagal load kategori:', err);
  }
}

function formatMembershipID(id) {
  return 'CUS-' + id.toString().padStart(5, '0');
}

function getDataPayload() {
  const getVal = id => document.getElementById(id).value.trim();

  const payload = {
    owner_id,
    // no_membership: getVal('formID'),
    no_membership: getVal('formID'),
    join_date: document.getElementById('formJoin').value || '',
    nama: getVal('formNama').toUpperCase(),
    alias: getVal('formAlias').toUpperCase(),
    whatsapp: getVal('formPhone'),
    email: getVal('formEmail'),
    nik: getVal('formNIK'),
    no_npwp: getVal('formNpwp'),
    birth: document.getElementById('formBirth').value || '',
    website: getVal('formWeb'),
    alamat: getVal('formAlamat'),
    region_name: getVal('cityInput'),
    kelurahan: getVal('formKelurahan'),
    kecamatan: getVal('formKecamatan'),
    kota: getVal('formKota'),
    provinsi: getVal('formProvinsi'),
    kode_pos: getVal('formPOS'),
    religion_id: 0,
    region_id: getVal('formregion_ID'),
    business_category_ids: Array.from(document.querySelectorAll('#kategoriForm input[name="kategori"]:checked'))
      .map(input => parseInt(input.value))
  };

  console.log(payload);

  // Validasi wajib
  if (!payload.nama || !payload.whatsapp) {
    Swal.fire({
      icon: 'warning',
      title: 'Data wajib belum lengkap',
      text: 'Isi Nama, dan Whatsapp terlebih dahulu.',
    });
    return null;
  }

  return payload;
}

async function submitData(method, id = '') {
  const payload = getDataPayload();
  if (!payload) return;

  const isCreate = method === 'POST';
  const url = `${baseUrl}/${isCreate ? 'add' : 'update'}/client${id ? '/' + id : ''}`;
  const actionText = isCreate ? 'menyimpan' : 'memperbarui';
  const successText = isCreate ? 'ditambahkan' : 'diperbarui';

  const confirm = await Swal.fire({
    icon: 'question',
    title: isCreate ? 'Simpan Data?' : 'Perbarui Data?',
    text: `Apakah Anda yakin ingin ${actionText} data pelanggan ini?`,
    showCancelButton: true,
    confirmButtonText: `Ya, ${isCreate ? 'simpan' : 'perbarui'}`,
    cancelButtonText: 'Batal'
  });

  if (!confirm.isConfirmed) return;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.data && result.data.id) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Data pelanggan berhasil ${successText}.`
      });
      const { id } = result.data;
      loadModuleContent('contact');
    } else {
      throw new Error(result.message || `Gagal ${actionText} data pelanggan`);
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.message || `Terjadi kesalahan saat ${actionText} data.`
    });
  }
}

async function createData() {
  await submitData('POST');
}

async function updateData() {
  await submitData('PUT', detail_id);
}

input = document.getElementById('cityInput');
resultList = document.getElementById('resultList');

// Fungsi debounce
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Fungsi pencarian dan render hasil
async function searchCity(query) {
  if (!query.trim()) {
    resultList.innerHTML = '';
    resultList.classList.add('hidden');
    return;
  }

  try {
    const url = `https://region.katib.cloud/table/region/${owner_id}/1?search=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer 0f4d99ae56bf938a9dc29d4f4dc499b919e44f4d3774cf2e5c7b9f5395d05fc6`
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const results = data.tableData || [];

    resultList.innerHTML = results.length
      ? results.map(item => `
          <li class="px-3 py-2 border-b hover:bg-gray-100 cursor-pointer"
              data-kelurahan="${item.kelurahan}"
              data-kecamatan="${item.kecamatan}"
              data-kota="${item.kota}"
              data-provinsi="${item.provinsi}"
              data-kodepos="${item.kode_pos}"
              data-region_id="${item.region_id}">
              ${item.kelurahan}, ${item.kecamatan}, ${item.kota}, ${item.provinsi} ${item.kode_pos}
          </li>`).join('')
      : '<li class="px-3 py-2 text-gray-500">Tidak ditemukan</li>';

    resultList.classList.remove('hidden');

    // Tambahkan event listener untuk setiap <li>
    resultList.querySelectorAll('li[data-kelurahan]').forEach(li => {
      li.addEventListener('click', () => {
        document.getElementById('formregion_ID').value = li.dataset.region_id;
        document.getElementById('formKelurahan').value = li.dataset.kelurahan;
        document.getElementById('formKecamatan').value = li.dataset.kecamatan;
        document.getElementById('formKota').value = li.dataset.kota;
        document.getElementById('formProvinsi').value = li.dataset.provinsi;
        document.getElementById('formPOS').value = li.dataset.kodepos;

        input.value = li.textContent;
        resultList.classList.add('hidden');
      });
    });

  } catch (err) {
    console.error('Gagal ambil data wilayah:', err);
    resultList.innerHTML = '<li class="px-2 py-1 text-red-500">Gagal ambil data</li>';
    resultList.classList.remove('hidden');
  }
}

input.addEventListener('input', debounce((e) => {
  searchCity(e.target.value);
}, 400));
