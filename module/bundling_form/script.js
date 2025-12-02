pagemodule = 'Product';
colSpanCount = 9;
setDataType('product');
loadProdukList();



if (window.detail_id) {
  // Mode update
  loadDetail(detail_id);
  document.getElementById('addButton').classList.add('hidden');

  printButton = document.getElementById('printButton');
  printButton.classList.remove('hidden');
  printButton.setAttribute('onclick', `printData(${window.detail_id})`);
}else {
  // Mode tambah
  restoreFormFromLocal();
  document.getElementById('updateButton').classList.add('hidden');
  // loadDropdown('formCategory', `${baseUrl}/list/business_category/${owner_id}`, 'business_category_id', 'business_category');


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

async function loadDetail(Id) {
  document.getElementById('formTitle').innerText = `UPDATE PRODUK KEMITRAAN`;
  window.detail_id = Id;

  await loadDropdown('formCategory', `${baseUrl}/list/business_category/${owner_id}`, 'business_category_id', 'business_category');
  // await loadDropdown('formUnit', `${baseUrl}/list/product_unit/${owner_id}`, 'unit_id', 'unit');
  // await loadDropdown('formStatus', `${baseUrl}/list/product_status/${owner_id}`, 'status_id', 'status');

  try {
    const res = await fetch(`${baseUrl}/detail/product_bundling/${Id}?_=${Date.now()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`
      },
      cache: 'no-store'
    });

    const { detail } = await res.json();
    console.log(detail);

    // Isi form utama
    document.getElementById('formSKU').value = detail.productcode || '';
    document.getElementById('formProduct').value = detail.product || '';
    document.getElementById('formCogs').value = detail.cogs?.toLocaleString('id-ID') || '';
    document.getElementById('formPrice').value = detail.sale_price?.toLocaleString('id-ID') || '';
    document.getElementById('formCategory').value = detail.business_category_id || '';
    document.getElementById('formDescription').value = detail.description || '';
    // document.getElementById('formStatus').checked = detail.status_id === 1;

    // Render detail item ke tabel
  const tbody = document.getElementById("tabelItem");
  tbody.innerHTML = ''; // Kosongkan isi tabel

  (detail.item_detail || []).forEach(item => {
    tambahItem(); // Tambahkan baris baru

    const row = tbody.lastElementChild;
    row.querySelector(".searchProduk").value = item.item_name;
    row.querySelector(".itemNama").value = item.item_id;
    row.querySelector(".itemQty").value = item.qty || 1;
    row.querySelector(".itemBerat").innerText = item.weight.toLocaleString('id-ID') || 0;
    row.querySelector(".itemHarga").value = item.cogs.toLocaleString('id-ID') || 0;
    const select = row.querySelector(".itemNama");
    const match = Array.from(select.options).find(o => o.textContent === item.item_id);
    if (match) select.value = match.value;

  });

  recalculateTotal();

  } catch (err) {
    console.error('Gagal load detail:', err);
  }
}

async function restoreFormFromLocal() {
  await loadDropdown('formCategory', `${baseUrl}/list/business_category/${owner_id}`, 'business_category_id', 'business_category');
  const draft = localStorage.getItem('draft_bundling_form');
  if (!draft) return;

  try {
    const detail = JSON.parse(draft);
    console.log('Memuat draft bundling dari localStorage:', detail);

    // Isi form utama
    document.getElementById('formSKU').value = detail.productcode || '';
    document.getElementById('formProduct').value = detail.product || '';
    document.getElementById('formCogs').value = detail.cogs?.toLocaleString('id-ID') || '';
    document.getElementById('formPrice').value = detail.sale_price?.toLocaleString('id-ID') || '';
    document.getElementById('formCategory').value = detail.business_category_id || '';
    document.getElementById('formDescription').value = detail.description || '';
    // document.getElementById('formStatus').checked = detail.status_id === 1;

    // Render ulang item_detail
    const tbody = document.getElementById('tabelItem');
    tbody.innerHTML = ''; // Kosongkan isi tabel

    (detail.item_detail || []).forEach(item => {
      tambahItem(); // Fungsi yang menambahkan 1 baris kosong
      

      const row = tbody.lastElementChild;
      row.querySelector('.searchProduk').value = item.item_name || '';
      row.querySelector('.itemNama').value = item.item_id || '';
      row.querySelector('.itemQty').value = item.qty || 1;
      row.querySelector('.itemBerat').innerText = (item.weight || 0).toLocaleString('id-ID');
      row.querySelector('.itemHarga').value = (item.cogs || 0).toLocaleString('id-ID');

      const select = row.querySelector('.itemNama');
      const match = Array.from(select.options).find(o => o.value == item.item_id);
      if (match) select.value = match.value;
    });

    recalculateTotal(); // Hitung ulang total dari tabel

  } catch (error) {
    console.error('Gagal restore form dari draft:', error);
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

async function loadProdukList() {
  const res = await fetch(`${baseUrl}/list/product/${owner_id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` }
  });
  const json = await res.json();
  produkList = json.listData || [];
  console.log(res);
}

function tambahItem() {
  const tbody = document.getElementById("tabelItem");
  const rowCount = tbody.rows.length;
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="px-3 py-2 border">
      <input type="text" placeholder="Cari Produk..." class="w-full border rounded px-2 mb-1 searchProduk" oninput="filterProdukDropdownCustom(this)" />
      <div class="produkDropdown hidden border bg-white shadow rounded max-h-40 overflow-y-auto z-50 absolute w-48"></div>
      <select class="hidden itemNama">
        <option value="" disabled selected>-- pilih produk --</option>
        ${produkList.map(p => `<option value="${p.product_id}" data-harga="${p.cogs}" data-nama="${p.product}">${p.product}</option>`).join('')}
      </select>
    </td>
    <td class="px-3 py-2 border text-right"><input type="number" class="w-full border rounded px-2 text-right itemQty" value="1" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right"><input type="text" class="w-full border rounded px-2 text-right itemHarga" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right itemBerat">0</td>
    <td class="px-3 py-2 border text-right itemSubtotal">0</td>
    
    <td class="px-3 py-2 border text-center">
      <button onclick="this.closest('tr').remove(); recalculateTotal();" class="text-red-500 hover:underline">🗑️</button>
    </td>
  `;
  tbody.appendChild(row);
}

function filterProdukDropdownCustom(inputEl) {
  const value = inputEl.value.toLowerCase();
  const dropdown = inputEl.nextElementSibling;
  const select = inputEl.parentElement.querySelector(".itemNama");
  dropdown.innerHTML = "";

  const filtered = produkList.filter(p => p.product.toLowerCase().includes(value));
  if (filtered.length === 0) return dropdown.classList.add("hidden");

  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "px-3 py-2 hover:bg-gray-200 cursor-pointer text-sm";
    div.textContent = p.product;
    
    div.onclick = () => {
      inputEl.value = p.product;
      // inputEl.closest("tr").querySelector(".itemHarga").value = p.cogs.toLocaleString('id-ID');
      const tr = inputEl.closest("tr");
      tr.querySelector(".itemBerat").innerText = (p.weight || 0);
      tr.querySelector(".itemHarga").value = p.cogs.toLocaleString('id-ID');

      const opt = Array.from(select.options).find(o => o.value == p.product_id);
      if (opt) select.value = opt.value;
      dropdown.classList.add("hidden");
      recalculateTotal();
    };
    dropdown.appendChild(div);
  });

  dropdown.classList.remove("hidden");
}

function recalculateTotal() {
  const rows = document.querySelectorAll('#tabelItem tr');
  let subtotal = 0;
  let weight = 0;
  let totalItem = 0;
  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.itemQty')?.value.replace(/[^\d]/g, '') || 0);
    const harga = parseFloat(row.querySelector('.itemHarga')?.value.replace(/[^\d]/g, '') || 0);
    const berat = parseFloat(row.querySelector('.itemBerat')?.innerText.replace(/[^\d]/g, '') || 0);
    const sub = qty * harga;
    subtotal += sub;
    weight += qty * berat;
    totalItem += qty;
    row.querySelector('.itemSubtotal').innerText = `${sub.toLocaleString('id-ID')}`;
  });
  const total = subtotal;
  document.getElementById('total').innerText = `${total.toLocaleString('id-ID')}`;
  document.getElementById('totalItem').innerText = `${totalItem.toLocaleString('id-ID')} item`;
  document.getElementById('totalBerat').innerText = `${weight.toLocaleString('id-ID')} gr`;
  
  if (!window.detail_id){
    saveFormToLocal();
    console.log('save to local');
  }else{
    autoSaveData();
    console.log('update to server');
  }
  
}

function getDataPayload() {
  const getVal = id => document.getElementById(id).value.trim();
  const getInt = id => parseInt(getVal(id).replace(/\./g, ''), 10) || 0;

  const rows = document.querySelectorAll('#tabelItem tr');
    const item_detail = Array.from(rows).map(row => {
      const product_id = row.querySelector('.itemNama')?.value || '';
      const name = row.querySelector('.searchProduk')?.value || '';
      const weight = parseInt((row.querySelector('.itemBerat')?.innerText || '0').replace(/\./g, ''));
      const qty = parseInt(row.querySelector('.itemQty').value || 0);
      const cogs = parseInt((row.querySelector('.itemHarga').value || '0').replace(/\./g, ''));
      return {
        item_id: product_id,
        item_name: name,
        weight: weight,
        qty: qty,
        cogs: cogs
      };
    });
  const payload = {
    owner_id,
    business_category_id: getVal('formCategory'),
    // status_id: 1,
    productcode: getVal('formSKU'),
    product: getVal('formProduct').toUpperCase(),
    cogs: getInt('formCogs'),
    sale_price: getInt('formPrice'),
    description: getVal('formDescription'),
    item_detail
  };

  // console.log (payload);

  // Validasi wajib
  if (!payload.productcode || !payload.product || !payload.cogs || !payload.sale_price) {
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

function saveFormToLocal() {
  const payload = getDataPayload();
  if (!payload) return;
  localStorage.setItem('draft_bundling_form', JSON.stringify(payload));
}

async function submitData(method, id = '') {
  const payload = getDataPayload();
  if (!payload) return;

  const url = `${baseUrl}/${method === 'POST' ? 'add' : 'update'}/product_bundling${id ? '/' + id : ''}`;
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

    if (result.data && result.data.product_id) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Produk berhasil ${actionText}`
      });
      localStorage.removeItem('draft_bundling_form');
      loadModuleContent('bundling');
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

async function updateData() {
  await submitData('PUT', detail_id);
}

async function createData() {
  await submitData('POST');
}

async function printData(product_id) {
  try {
    const response = await fetch(`${baseUrl}/detail/product_bundling/${product_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    const result = await response.json();
    const detail = result?.detail;

    if (!detail) throw new Error('Data produk bundling tidak ditemukan');

    // Tampilkan pilihan ke user
    const { isConfirmed, dismiss } = await Swal.fire({
      title: 'Cetak Data Produk',
      text: 'Pilih metode pencetakan:',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Download PDF',
      cancelButtonText: 'Print Langsung',
      reverseButtons: true
    });

    const url = `print_product_bundling.html?ids=${product_id}`;

    if (isConfirmed) {
      // === Download PDF (pakai iframe) ===
      Swal.fire({
        title: 'Menyiapkan PDF...',
        html: 'File akan diunduh otomatis.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();

          const iframe = document.createElement('iframe');
          iframe.src = `${url}&mode=download`;
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = 'none';
          document.body.appendChild(iframe);

          setTimeout(() => {
            Swal.close();
            Swal.fire('Berhasil', 'Data berhasil diunduh.', 'success');
          }, 3000);
        }
      });

    } else if (dismiss === Swal.DismissReason.cancel) {
      // === Print langsung (open tab) ===
      window.open(url, '_blank');
    }

  } catch (error) {
    Swal.fire({
      title: 'Gagal',
      text: error.message,
      icon: 'error'
    });
  }
}

async function autoSaveData() {
  const payload = getDataPayload();
  if (!payload) return;

  const url = `${baseUrl}/update/product_bundling/${detail_id}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const result = await response.json();
      console.error('Auto save gagal:', result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Auto save error:', error);
  }
}







