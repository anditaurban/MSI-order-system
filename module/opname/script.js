pagemodule = 'Product';
colSpanCount = 9;
setDataType('product');

setupPriceInputEvents();

if (window.detail_id) {
  // Mode update
  loadDetail(detail_id);
  document.getElementById('addButton').classList.add('hidden');
}else {
  // Mode tambah
  document.getElementById('updateButton').classList.add('hidden');
  loadDropdown('formCategory', `${baseUrl}/list/product_category/${owner_id}`, 'category_id', 'category');
  loadDropdown('formUnit', `${baseUrl}/list/product_unit/${owner_id}`, 'unit_id', 'unit');
  // loadDropdown('formStatus', `${baseUrl}/list/product_status/${owner_id}`, 'status_id', 'status');
  loadKategoriOptions();

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

async function loadDetail(Id) {
  document.getElementById('formTitle').innerText = `UPDATE DATA PRODUK`;
  window.detail_id = Id;

  await loadDropdown('formCategory', `${baseUrl}/list/product_category/${owner_id}`, 'category_id', 'category');
  await loadDropdown('formUnit', `${baseUrl}/list/product_unit/${owner_id}`, 'unit_id', 'unit');
  // await loadDropdown('formStatus', `${baseUrl}/list/product_status/${owner_id}`, 'status_id', 'status');

try {
  const res = await fetch(`${baseUrl}/detail/product/${Id}?_=${Date.now()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`
    },
    cache: 'no-store' // ⬅️ Ini memastikan data tidak diambil dari cache
  });

    const { detail } = await res.json();
    console.log(detail);
    document.getElementById('formSKU').value = detail.productcode || '';
    document.getElementById('formProduct').value = detail.product || '';
    document.getElementById('formCogs').value = detail.cogs?.toLocaleString('id-ID') || '';
    document.getElementById('formPrice').value = detail.sale_price?.toLocaleString('id-ID') || '';
    document.getElementById('formWholesale').value = detail.wholesale_price?.toLocaleString('id-ID') || '';
    document.getElementById('formLimit').value = detail.limitstock || '';
    document.getElementById('formCategory').value = detail.category_id || '';
    document.getElementById('formUnit').value = detail.unit_id || '';
    document.getElementById('formBerat').value = detail.weight?.toLocaleString('id-ID') || '';
    document.getElementById('formDescription').value = detail.description || '';
    // document.getElementById('formStatus').checked = detail.status_id === 1;

    // Ambil business_category_id dari array business_categories
    const selectedBusinessCategories = (detail.business_categories || []).map(cat => cat.business_category_id);

    // Load dan centang kategori
    await loadKategoriOptions(Id, selectedBusinessCategories);

  } catch (err) {
    console.error('Gagal load detail:', err);
  }
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



function getDataPayload() {
  const getVal = id => document.getElementById(id).value.trim();
  const getInt = id => parseInt(getVal(id).replace(/\./g, ''), 10) || 0;

  const payload = {
    owner_id,
    productcode: getVal('formSKU'),
    barcode: getVal('formSKU'),
    product: getVal('formProduct'),
    description: getVal('formDescription'),
    limitstock: getInt('formLimit'),
    category_id: parseInt(getVal('formCategory')),
    business_category_id: 0,
    unit_id: parseInt(getVal('formUnit')),
    cogs: getInt('formCogs'),
    sale_price: getInt('formPrice'),
    wholesale_price: getInt('formWholesale'),
    weight: getInt('formBerat'),
    // status_id: 1,
    business_category_ids: Array.from(document.querySelectorAll('#kategoriForm input[name="kategori"]:checked'))
      .map(input => parseInt(input.value))

  };

  console.log (payload);

  // Validasi wajib
  if (!payload.productcode || !payload.product || !payload.cogs || !payload.sale_price || !payload.category_id || !payload.unit_id) {
    Swal.fire({
      icon: 'warning',
      title: 'Lengkapi data',
      text: 'Pastikan semua input wajib sudah diisi.'
    });
    return null;
  }

  // Validasi logika harga
  if (payload.sale_price < payload.cogs) {
    Swal.fire({
      icon: 'warning',
      title: 'Harga Tidak Valid',
      text: 'Harga jual tidak boleh lebih rendah dari harga pokok (COGS).'
    });
    return null;
  }

  if (payload.wholesale_price > payload.sale_price || payload.wholesale_price < payload.cogs) {
    Swal.fire({
      icon: 'warning',
      title: 'Harga Grosir Tidak Valid',
      text: 'Harga grosir harus di antara harga pokok dan harga jual.'
    });
    return null;
  }

  return payload;
}

async function submitData(method, id = '') {
  const payload = getDataPayload();
  if (!payload) return;

  const url = `${baseUrl}/${method === 'POST' ? 'add' : 'update'}/product${id ? '/' + id : ''}`;
  const actionText = method === 'POST' ? 'ditambahkan' : 'diperbarui';

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
        text: `Produk berhasil ${actionText}`
      });
      loadModuleContent('product');
    } else {
      throw new Error(result.message || `Gagal ${actionText} produk`);
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.message || `Terjadi kesalahan saat ${actionText} produk.`
    });
  }
}

// Contoh penggunaan:
async function createData() {
  await submitData('POST');
}

async function updateData() {
  await submitData('PUT', detail_id);
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

function formatCurrencyInput(input) {
  const raw = input.value.replace(/[^\d]/g, '');
  if (!raw) {
    input.value = '';
    return;
  }
  input.value = parseInt(raw, 10).toLocaleString('id-ID');
}

function getNumericValue(inputId) {
  const val = document.getElementById(inputId).value.replace(/[^\d]/g, '');
  return parseInt(val || '0', 10);
}

function validatePrices() {
  const cogs = getNumericValue('formCogs');
  const price = getNumericValue('formPrice');
  const wholesale = getNumericValue('formWholesale');

  // Reset messages
  document.getElementById('warnPrice').textContent = '';
  document.getElementById('warnWholesale').textContent = '';

  if (price < cogs) {
    document.getElementById('warnPrice').textContent = '❌ Harga jual tidak boleh lebih rendah dari harga pokok.';
  }

  if (wholesale > price || wholesale < cogs) {
    document.getElementById('warnWholesale').textContent = '❌ Harga grosir harus di antara harga pokok dan harga jual.';
  }
}

function setupPriceInputEvents() {
  ['formCogs', 'formPrice', 'formWholesale'].forEach(id => {
    const input = document.getElementById(id);

    input.addEventListener('input', () => {
      formatCurrencyInput(input);

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        validatePrices();
      }, 800);
    });
  });
}










