pagemoduleparent = 'sales'

  
  setTodayDate();
  loadCustomerList();
  formatNumberInputs();
  loadCourierList();
  loadTypeOrder();
  loadEmployeeList() 

  if (window.detail_id && window.detail_desc){
    // loadProdukList(window.detail2_desc);
    loadDetailSales(detail_id, detail_desc)
    loadPaymentDetail(detail_id, 0)
    formatNumberInputs();
  }else{
    // loadProdukList();
  }
  
  


async function loadCustomerList() {
  const res = await fetch(`${baseUrl}/list/client/${owner_id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` }
  });
  const json = await res.json();
  customerList = json.listData || [];
}

async function loadProdukList(customer_id) {
  const res = await fetch(`${baseUrl}/list/product_sales/${customer_id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` }
  });
  const json = await res.json();
  produkList = json.listData || [];
}

async function loadEmployeeList() {
  try {
    const res = await fetch(`${baseUrl}/list/salesman/${owner_id}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    const json = await res.json();
    const employeeList = json.listData || [];

    console.log(employeeList);

    const select = document.getElementById("salesman");
    select.innerHTML = '<option value="">-- Pilih Sales --</option>';

    employeeList.forEach(emp => {
      const option = document.createElement("option");
      option.value = emp.salesman_id;
      option.textContent = emp.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Gagal memuat data karyawan:", err);
  }
}

function filterKlienSuggestions() {
  const input = document.getElementById('klien').value.toLowerCase();
  const suggestionBox = document.getElementById('klienSuggestions');
  suggestionBox.innerHTML = '';
  if (input.length < 2) return suggestionBox.classList.add('hidden');
  const filtered = customerList.filter(c => c.nama.toLowerCase().includes(input));
  if (filtered.length === 0) return suggestionBox.classList.add('hidden');
  filtered.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nama} (${item.whatsapp})`;
    li.className = 'px-3 py-2 hover:bg-gray-200 cursor-pointer';
    li.onclick = () => {
      document.getElementById('klien').value = item.nama;
      document.getElementById('klien_id').value = item.pelanggan_id;
      document.getElementById('no_hp').value = item.whatsapp;
      document.getElementById('alamat').value = item.alamat;
      document.getElementById('city').value = item.region_name;
      document.getElementById('city_id').value = item.region_id;
      suggestionBox.classList.add('hidden');
      loadProdukList(item.pelanggan_id);
    };
    suggestionBox.appendChild(li);
  });
  suggestionBox.classList.remove('hidden');
}

function tambahItem() {
  const tbody = document.getElementById("tabelItem");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="px-3 py-2 border">
      <input type="text" placeholder="Cari Produk..." class="w-full border rounded px-2 mb-1 searchProduk" oninput="filterProdukDropdownCustom(this)" />
      <div class="produkDropdown hidden border bg-white shadow rounded max-h-40 overflow-y-auto z-50 absolute w-48"></div>
      <select class="itemNama hidden">
        ${produkList.map(p => `<option value="${p.product_id}" data-harga="${p.sale_price}" data-nama="${p.product}">${p.product}</option>`).join('')}
      </select>
    </td>
    <td class="px-3 py-2 border text-right"><input type="number" class="w-full border rounded px-2 text-right itemQty" value="1" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right"><input type="text" class="w-full border rounded px-2 text-right itemHarga" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right itemBerat hidden">0</td>
    <td class="px-3 py-2 border text-right"><input type="text" class="w-full border rounded px-2 text-right itemDiskon" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right itemSubtotal">0</td>
    
    <td class="px-3 py-2 border text-center">
      <button onclick="this.closest('tr').remove(); recalculateTotal();" class="text-red-500 hover:underline">🗑️</button>
    </td>
  `;
  tbody.appendChild(row);
  formatNumberInputs();
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
      // inputEl.closest("tr").querySelector(".itemHarga").value = p.sale_price.toLocaleString('id-ID');
      const tr = inputEl.closest("tr");
      tr.querySelector(".itemHarga").value = p.sale_price.toLocaleString('id-ID');
      tr.querySelector(".itemBerat").innerText = (p.weight || 0);

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
  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.itemQty')?.value.replace(/[^\d]/g, '') || 0);
    const harga = parseFloat(row.querySelector('.itemHarga')?.value.replace(/[^\d]/g, '') || 0);
    const itemdiskon = parseFloat(row.querySelector('.itemDiskon')?.value.replace(/[^\d]/g, '') || 0);
    const berat = parseFloat(row.querySelector('.itemBerat')?.innerText.replace(/[^\d]/g, '') || 0);
    const sub = (qty * harga) - itemdiskon;
    subtotal += sub;
    weight += qty * berat;
    row.querySelector('.itemSubtotal').innerText = `${sub.toLocaleString('id-ID')}`;
  });
  const diskon = parseInt(document.getElementById('inputDiskon').value.replace(/[^\d]/g, '') || 0);
  const mp_admin = parseInt(document.getElementById('inputmp_admin').value.replace(/[^\d]/g, '') || 0);
  const shipping = parseInt(document.getElementById('inputShipping').value.replace(/[^\d]/g, '') || 0);
  const pajak = Math.round(0 * subtotal);
  const total = subtotal - diskon + pajak + shipping + mp_admin;
  document.getElementById('subtotal').innerText = `${subtotal.toLocaleString('id-ID')}`;
  document.getElementById('diskon').innerText = `${diskon.toLocaleString('id-ID')}`;
  document.getElementById('pajak').innerText = `${pajak.toLocaleString('id-ID')}`;
  document.getElementById('mp_admin').innerText = `${mp_admin.toLocaleString('id-ID')}`;
  document.getElementById('ongkir').innerText = `${shipping.toLocaleString('id-ID')}`;
  document.getElementById('total').innerText = `${total.toLocaleString('id-ID')}`;
  document.getElementById('totalBerat').innerText = `${weight.toLocaleString('id-ID')} gr`;
}

function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById("tanggal").value = `${yyyy}-${mm}-${dd}`;
}

function formatNumberInputs() {
  document.querySelectorAll('.itemHarga, #inputDiskon, #inputShipping, #inputmp_admin').forEach(input => {
    input.addEventListener('input', () => {
      const raw = input.value.replace(/[^\d]/g, '');
      if (!raw) {
        input.value = '';
        return;
      }
      input.value = parseInt(raw, 10).toLocaleString('id-ID');
      recalculateTotal();
    });
  });
}

async function submitInvoice() {
  try {
    const rows = document.querySelectorAll('#tabelItem tr');
    const sales_detail = Array.from(rows).map(row => {
      const select = row.querySelector('.itemNama');
      const qty = parseInt(row.querySelector('.itemQty').value || 0);
      const harga = parseInt(row.querySelector('.itemHarga').value.replace(/[^\d]/g, '') || 0);
      const itemdiskon = parseInt(row.querySelector('.itemDiskon')?.value.replace(/[^\d]/g, '') || 0);
      return {
        product_id: parseInt(select.value),
        quantity: qty,
        sale_price: harga,
        discount_price: itemdiskon
      };
    });

    const subtotal = sales_detail.reduce((total, item) => total + (item.sale_price * item.quantity), 0);
    const discount = parseInt(document.getElementById('inputDiskon').value.replace(/[^\d]/g, '') || 0);
    const shipping = parseInt(document.getElementById('inputShipping').value.replace(/[^\d]/g, '') || 0);
    const mp_admin = parseInt(document.getElementById('inputmp_admin').value.replace(/[^\d]/g, '') || 0);
    const tax = Math.round(0 * subtotal);
    const courier_id = parseInt(document.getElementById('selectCourier').value || 0);
    const salesman_id = parseInt(document.getElementById('salesman').value || 0);
    const courier_note = document.getElementById('courierNote').value;
    const type_id = parseInt(document.getElementById('selectType').value || 0);
    const catatan = document.getElementById('catatan').value;
    const syaratketentuan = document.getElementById('syaratketentuan').value;
    const termpayment = document.getElementById('termpayment').value;

    const body = {
      owner_id,
      user_id,
      date: document.getElementById('tanggal').value,
      customer_id: parseInt(document.getElementById('klien_id').value),
      salesman_id: salesman_id,
      discount_nominal: discount,
      tax_percent: 0,
      tax: tax,
      shipping: shipping,
      mp_admin: mp_admin,
      sales_detail,
      courier_id: courier_id,
      courier_note: courier_note,
      type_id: type_id, 
      catatan: catatan, 
      syaratketentuan: syaratketentuan, 
      termpayment: termpayment

    };

    console.log(body);

    const res = await fetch(`${baseUrl}/add/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const json = await res.json();

if (String(json.success) === "true") {
  Swal.fire('Sukses', json.message || '✅ Data penjualan berhasil disimpan.', 'success');
  loadModuleContent('sales');
} else {
  Swal.fire('Gagal', json.message || '❌ Gagal menyimpan data penjualan.', 'error');
}

  } catch (error) {
    console.error(error);
    Swal.fire('Error', '❌ Terjadi kesalahan saat memproses.', 'error');
  }
}

async function updateInvoice() {
  try {
    const konfirmasi = await Swal.fire({
      title: 'Update Data?',
      text: 'Apakah kamu yakin ingin menyimpan perubahan invoice ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✅ Ya, simpan',
      cancelButtonText: '❌ Batal'
    });

    if (!konfirmasi.isConfirmed) return;

    const rows = document.querySelectorAll('#tabelItem tr');
    const sales_detail = Array.from(rows).map(row => {
      const select = row.querySelector('.itemNama');
      const qty = parseInt(row.querySelector('.itemQty').value || 0);
      const harga = parseInt(row.querySelector('.itemHarga').value.replace(/[^\d]/g, '') || 0);
      const itemdiskon = parseInt(row.querySelector('.itemDiskon')?.value.replace(/[^\d]/g, '') || 0);
      return {
        product_id: parseInt(select.value),
        quantity: qty,
        sale_price: harga,
        discount_price: itemdiskon
      };
    });

    const subtotal = sales_detail.reduce((total, item) => total + (item.sale_price * item.quantity), 0);
    const discount = parseInt(document.getElementById('inputDiskon').value.replace(/[^\d]/g, '') || 0);
    const shipping = parseInt(document.getElementById('inputShipping').value.replace(/[^\d]/g, '') || 0);
    const mp_admin = parseInt(document.getElementById('inputmp_admin').value.replace(/[^\d]/g, '') || 0);
    const tax = Math.round(0 * subtotal);
    const courier_id = parseInt(document.getElementById('selectCourier').value || 0);
    const salesman_id = parseInt(document.getElementById('salesman').value || 0);
    const courier_note = document.getElementById('courierNote').value;
    const type_id = parseInt(document.getElementById('selectType').value || 0);
    const catatan = document.getElementById('catatan').value;
    const syaratketentuan = document.getElementById('syaratketentuan').value;
    const termpayment = document.getElementById('termpayment').value;

    const body = {
      owner_id,
      user_id,
      date: document.getElementById('tanggal').value,
      customer_id: parseInt(document.getElementById('klien_id').value),
      salesman_id: salesman_id,
      discount_nominal: discount,
      tax_percent: 0,
      tax: tax,
      shipping: shipping,
      mp_admin: mp_admin,
      sales_detail,
      courier_id: courier_id,
      courier_note: courier_note,
      type_id: type_id, 
      catatan: catatan, 
      syaratketentuan: syaratketentuan, 
      termpayment: termpayment
    };

    console.log(body);

    const res = await fetch(`${baseUrl}/update/sales/${window.detail_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const json = await res.json();
    console.log("OUTPUT = ", json);

// if (String(json.success) === "true") {
//   Swal.fire('Sukses', json.message || '✅ Data penjualan berhasil disimpan.', 'success');
//   loadModuleContent('sales');
// } else {
//   Swal.fire('Gagal', json.message || '❌ Gagal menyimpan data penjualan.', 'error');
// }

if (String(json.data?.success) === "true") {
  Swal.fire('Sukses', json.data?.message || '✅ Data penjualan berhasil disimpan.', 'success');
  loadModuleContent('sales');
} else {
  Swal.fire('Gagal', json.data?.message || '❌ Gagal menyimpan data penjualan.', 'error');
}

  } catch (error) {
    console.error(error);
    Swal.fire('Error', '❌ Terjadi kesalahan saat memproses.', 'error');
  }
}

async function loadCourierList() {
  try {
    const res = await fetch(`${baseUrl}/list/courier/${owner_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    const result = await res.json();
    const list = result.listData || [];

    const courierSelect = document.getElementById('selectCourier');
    courierSelect.innerHTML = '<option value="">-- Pilih Kurir --</option>';

    list.forEach(courier => {
      const option = document.createElement('option');
      option.value = courier.courier_id; // atau courier.id jika ingin ID
      option.textContent = courier.courier;
      courierSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Gagal memuat daftar kurir:', error);
  }
}

async function loadTypeOrder() {
  try {
    const res = await fetch(`${baseUrl}/list/sales_type/${owner_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    const result = await res.json();
    const list = result.listData || [];
    console.log('sales type : ', list);

    const courierSelect = document.getElementById('selectType');
    courierSelect.innerHTML = '<option value="">-- Pilih Type Penjualan --</option>';

    list.forEach(sales => {
      const option = document.createElement('option');
      option.value = sales.type_id; // atau courier.id jika ingin ID
      option.textContent = sales.sales_type;
      courierSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Gagal memuat daftar kurir:', error);
  }
}

  function handleCourierChange() {
    const selected = document.getElementById('selectCourier').value;
    console.log('Kurir dipilih:', selected);
    // kamu bisa lanjutkan fetch tarif berdasarkan berat dan kota jika perlu
  }

function loadDetailSales(Id, Detail) {
  window.detail_id = Id;
  window.detail_desc = Detail;

  fetch(`${baseUrl}/detail/sales/${Id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` }
  })
    .then(res => res.json())
    .then(({ detail }) => {
      // Pastikan loadProdukList selesai dulu
      return loadProdukList(detail.customer_id).then(() => detail);
      })    
    .then((detail) => {
      document.getElementById('formTitle').innerText = `UPDATE FAKTUR ${detail_desc}`;
      document.getElementById('tanggal').value = formatDateForInput(detail.date);
      document.getElementById('klien').value = detail.customer;
      document.getElementById('no_hp').value = detail.whatsapp;
      document.getElementById('alamat').value = detail.alamat;
      document.getElementById('city').value = detail.region_name;
      document.getElementById('city_id').value = detail.region_id;
      document.getElementById('klien_id').value = detail.customer_id || '';
      document.getElementById('inputDiskon').value = detail.discount_nominal.toLocaleString('id-ID');
      document.getElementById('inputShipping').value = detail.shipping.toLocaleString('id-ID');
      document.getElementById('inputmp_admin').value = detail.mp_admin.toLocaleString('id-ID');
      document.getElementById('statusPackage').innerText = detail.status_package || '-';
      document.getElementById('statusShipment').innerText = detail.status_shipment || '-';
      document.getElementById('selectCourier').value = detail.courier_id;
      document.getElementById('courierNote').value = detail.courier_note;
      document.getElementById('salesman').value = detail.salesman_id;
      document.getElementById('selectType').value = detail.type_id;
      document.getElementById('catatan').value = detail.catatan;
      document.getElementById('syaratketentuan').value = detail.syaratketentuan;
      document.getElementById('termpayment').value = detail.termpayment;
      console.log(detail);


      // Toggle tombol berdasarkan status
      const simpanBtn = document.querySelector('button[onclick="submitInvoice()"]');
      const updateBtn = document.querySelector('button[onclick="updateInvoice()"]');
      const allowedStatus = [2, 6];

      if (allowedStatus.includes(detail.status_id)) {
        simpanBtn?.classList.add('hidden'); // karena ini mode edit
        updateBtn?.classList.remove('hidden');
      } else {
        simpanBtn?.classList.add('hidden');
        updateBtn?.classList.add('hidden');
      }

      // Load item
      const tbody = document.getElementById("tabelItem");
      tbody.innerHTML = '';
      detail.sales_detail.forEach(item => {
        tambahItem();
        const row = tbody.lastElementChild;
        row.querySelector(".searchProduk").value = item.product;
        row.querySelector(".itemNama").value = item.product_id;
        row.querySelector(".itemQty").value = item.qty;
        row.querySelector(".itemHarga").value = item.unit_price.toLocaleString('id-ID');
        row.querySelector(".itemBerat").innerText = item.weight.toLocaleString('id-ID') || 0;
        row.querySelector(".itemDiskon").value = item.discount_price.toLocaleString('id-ID');
        const select = row.querySelector(".itemNama");
        const match = Array.from(select.options).find(o => o.textContent === item.product_id);
        if (match) select.value = match.value;
        console.log(item.weight);
      });

      recalculateTotal();
    })
    .catch(err => console.error('Gagal load detail:', err));
}


function formatDateForInput(dateStr) {
  const [d, m, y] = dateStr.split('/');
  return `${y}-${m}-${d}`;
}

async function loadPaymentDetail(detail_id) {
  try {
    const res = await fetch(`${baseUrl}/list/sales_receipt/${owner_id}/${detail_id}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    const { totalInvoice, totalReceipt, totalRemainingPayment, listData } = await res.json();

    // Inject Ringkasan Pembayaran
    document.getElementById('paymentTotalInvoice').innerText = `Rp ${totalInvoice.toLocaleString('id-ID')}`;
    document.getElementById('paymentTotalPaid').innerText = `Rp ${totalReceipt.toLocaleString('id-ID')}`;
    document.getElementById('paymentRemaining').innerText = `Rp ${totalRemainingPayment.toLocaleString('id-ID')}`;

    // Inject List Pembayaran
    const wrapper = document.getElementById('listPembayaran');
    wrapper.innerHTML = '';

    if (!listData || listData.length === 0) {
      wrapper.innerHTML = '<p class="text-sm text-gray-500">Belum ada pembayaran.</p>';
      return;
    }

    listData.forEach(item => {
      const div = document.createElement('div');
      div.className = 'border p-3 rounded text-sm bg-white';
      div.innerHTML = `
        <div class="flex justify-between">
          <div class="font-semibold">${item.account}</div>
          <div class="text-gray-500 text-sm">${item.date}</div>
        </div>
        <div class="flex justify-between mt-1">
          <div class="text-gray-600">${item.notes || '-'}</div>
          <div class="font-bold text-green-700">Rp ${item.nominal.toLocaleString('id-ID')}</div>
        </div>
      `;
      wrapper.appendChild(div);
    });

  } catch (err) {
    console.error("❌ Gagal memuat detail pembayaran:", err);
  }
}


async function printInvoice(invoice_id) {
  try {
    const response = await fetch(`${baseUrl}/detail/sales/${invoice_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    const result = await response.json();
    const data = result?.detail;
    if (!data) throw new Error('Data paket tidak ditemukan');

    // Tampilkan pilihan aksi ke user
    const { isConfirmed, dismiss } = await Swal.fire({
      title: 'Cetak Faktur Penjualan',
      text: 'Pilih metode pencetakan:',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Download PDF',
      cancelButtonText: 'Print Langsung',
      reverseButtons: true
    });

    if (isConfirmed) {
      const url = `print_faktur.html?id=${invoice_id}`;
      // === Download PDF (via packing_print.html di iframe) ===
      Swal.fire({
        title: 'Menyiapkan PDF...',
        html: 'File akan diunduh otomatis.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();


            const iframe = document.createElement('iframe');
            iframe.src = url + '&mode=download';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);


          setTimeout(() => {
            Swal.close();
            Swal.fire('Berhasil', 'Faktur Penjualan berhasil diunduh.', 'success');
          }, 3000);
        }
      });

    } else if (dismiss === Swal.DismissReason.cancel) {
      // === Print Langsung (open tab) ===
      window.open(`print_faktur.html?id=${invoice_id}`, '_blank');
    }

  } catch (error) {
    Swal.fire({
      title: 'Gagal',
      text: error.message,
      icon: 'error'
    });
  }
}

async function sendWhatsAppInvoice() {
  if (!window.detail_id) return alert("Invoice belum tersedia.");

  try {
    const res = await fetch(`${baseUrl}/detail/sales/${window.detail_id}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });

    const { detail } = await res.json();
    const { customer, no_inv, date, sales_detail, discount_nominal, shipping, terms, term_payment, notes } = detail;

    // Cari nomor WA dari customerList
    const klien = customerList.find(c => c.pelanggan_id == detail.customer_id);
    const wa = klien?.whatsapp?.replace(/\D/g, '').replace(/^0/, '62');
    if (!wa) return alert('❌ Nomor WhatsApp klien tidak ditemukan.');

    // Format daftar produk
    let produkList = '';
    let subtotal = 0;
    sales_detail.forEach((item, i) => {
      const qty = item.qty;
      const harga = item.unit_price;
      const total = qty * harga;
      subtotal += total;
      produkList += `${i + 1}. ${item.product} x${qty} @Rp${harga.toLocaleString('id-ID')} = Rp${total.toLocaleString('id-ID')}\n`;
    });

    const pajak = Math.round(subtotal * 0);
    const total = subtotal - discount_nominal + pajak + shipping;

    // Susun pesan WA
    let pesan = `Hallo ${customer},\n\nBerikut tagihan untuk invoice *${no_inv}* (tgl: ${date}):\n\n`;
    pesan += produkList + '\n';
    pesan += `Subtotal: Rp${subtotal.toLocaleString('id-ID')}\n`;
    if (discount_nominal) pesan += `Diskon: Rp${discount_nominal.toLocaleString('id-ID')}\n`;
    pesan += `Pajak (0%): Rp${pajak.toLocaleString('id-ID')}\n`;
    if (shipping) pesan += `Ongkir: Rp${shipping.toLocaleString('id-ID')}\n`;
    pesan += `*Total Tagihan: Rp${total.toLocaleString('id-ID')}*\n\n`;
    if (notes) pesan += `📝 *Catatan:*\n${notes}\n\n`;
    if (terms) pesan += `📌 *Syarat & Ketentuan:*\n${terms}\n\n`;
    if (term_payment) pesan += `💰 *Term of Payment:*\n${term_payment}\n\n`;
    pesan += `Silakan lakukan pembayaran sesuai ketentuan. Terima kasih 🙏`;

    // Kirim via WA
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(pesan)}`;
    window.open(url, '_blank');

  } catch (err) {
    console.error("❌ Gagal kirim WA:", err);
    alert("Gagal mengirim pesan WhatsApp.");
  }
}



