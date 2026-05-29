pagemoduleparent = "sales";

setTodayDate();
loadCustomerList();
formatNumberInputs();
loadCourierList();
loadTypeOrder();
loadEmployeeList();

if (window.detail_id && window.detail_desc) {
  // loadProdukList(window.detail2_desc);
  loadDetailSales(detail_id, detail_desc);
  loadPaymentDetail(detail_id, 0);
  formatNumberInputs();
} else {
  // loadProdukList();
}

async function loadCustomerList(currentPage = 1) {
  // Menambahkan default value 1
  try {
    // Menggunakan template literal untuk memasukkan variabel currentPage
    const res = await fetch(
      `${baseUrl}/table/client/${owner_id}/${currentPage}?search=`,
      {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      },
    );

    const json = await res.json();

    // Sesuaikan akses ke properti 'tableData' sesuai response yang Anda kirim
    customerList = json.tableData || [];
    console.log(
      `Data Mitra Halaman ${currentPage} Berhasil Dimuat:`,
      customerList,
    );
  } catch (err) {
    console.error("Gagal memuat data mitra:", err);
  }
}

async function loadProdukList(customer_id) {
  const res = await fetch(`${baseUrl}/list/product_sales_msi/${customer_id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  const json = await res.json();
  produkList = json.listData || [];
}

async function loadEmployeeList() {
  try {
    const res = await fetch(`${baseUrl}/list/salesman/${owner_id}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
    const json = await res.json();
    const employeeList = json.listData || [];

    console.log(employeeList);

    const select = document.getElementById("salesman");
    select.innerHTML = '<option value="">-- Pilih Sales --</option>';

    employeeList.forEach((emp) => {
      const option = document.createElement("option");
      option.value = emp.salesman_id;
      option.textContent = emp.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Gagal memuat data karyawan:", err);
  }
}

// Variabel untuk mencegah request bertabrakan (debounce)


async function filterKlienSuggestions() {
  const input = document.getElementById("klien").value.toLowerCase().trim();
  const suggestionBox = document.getElementById("klienSuggestions");

  // Bersihkan timeout lama
  clearTimeout(searchTimeout);

  if (input.length < 2) {
    suggestionBox.innerHTML = "";
    suggestionBox.classList.add("hidden");
    return;
  }

  // Gunakan debounce agar tidak nembak API setiap huruf (hemat kuota)
  searchTimeout = setTimeout(async () => {
    try {
      // PANGGIL API DENGAN PARAMETER SEARCH
      // Kita panggil page 1 tapi dengan query search yang diisi input user
      const res = await fetch(
        `${baseUrl}/table/client/${owner_id}/1?search=${input}`,
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        },
      );

      const json = await res.json();
      const results = json.tableData || [];

      if (results.length === 0) {
        suggestionBox.innerHTML = "";
        suggestionBox.classList.add("hidden");
        return;
      }

      // Render hasil pencarian dari API
      suggestionBox.innerHTML = "";

results.forEach((item) => {
  const li = document.createElement("li");

  // --- BAGIAN PERUBAHAN DI SINI ---
  // Kita ambil semua 'business_category', lalu gabungkan dengan koma
  const membershipLabel = (item.business_categories && item.business_categories.length > 0) 
                          ? item.business_categories.map(cat => cat.business_category).join(", ") 
                          : "No Cat";
  // --------------------------------

  li.textContent = `${item.nama} (${membershipLabel})`;
  li.className = "px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-0";

  li.onclick = () => {
    document.getElementById("klien").value = item.nama;
    document.getElementById("klien_id").value = item.pelanggan_id;
    document.getElementById("no_hp").value = item.whatsapp || "";
    document.getElementById("alamat").value = item.alamat || "";
    document.getElementById("city").value = item.region_name || "";
    document.getElementById("city_id").value = item.region_id || "";
    let memConfig = null;
      if (item.membership_id == 1) {
        memConfig = { text: 'FREE', classes: ['bg-gray-200', 'text-gray-600'] };
      } else if (item.membership_id == 2) {
        memConfig = { text: 'VIP', classes: ['bg-yellow-400', 'text-yellow-900'] };
      }

      updateBadge('membershipBadge', memConfig);
      
      // Terapkan ke WA jika nomor ada
      if (item.whatsapp && item.whatsapp.trim() !== '') {
         updateBadge('waBadge', memConfig);
      } else {
         updateBadge('waBadge', null);
      }
    loadPicToSelect(item.customer_pic, item);
    suggestionBox.classList.add("hidden");
  };

  suggestionBox.appendChild(li);
});
      suggestionBox.classList.remove("hidden");
    } catch (err) {
      console.error("Gagal search mitra:", err);
    }
  }, 500); // Tunggu 500ms setelah user berhenti mengetik
}
function loadPicToSelect(picList, parentData) {
  const picSelect = document.getElementById("selectPic");
  picSelect.innerHTML = '<option value="">-- Pilih Customer (PIC) --</option>';

  if (picList && picList.length > 0 && picList[0].contact_id !== null) {
    picList.forEach((pic) => {
      const option = document.createElement("option");
      option.value = pic.contact_id;
      option.textContent = pic.name || "No Name";
      picSelect.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.value = "0";
    option.textContent = "Data Utama Mitra";
    picSelect.appendChild(option);
  }

  // Handle pengisian contact_id saja
  picSelect.onchange = (e) => {
    const selectedValue = e.target.value;
    document.getElementById("contact_id").value = selectedValue || "0";

    // Trigger load produk saat PIC/Mitra sudah dipastikan terpilih
    const pelangganId = document.getElementById("klien_id").value;
    if (pelangganId) {
      loadProdukList(pelangganId);
    }
  };
}

function tambahItem() {
  const tbody = document.getElementById("tabelItem");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="px-3 py-2 border">
      <input type="text" placeholder="Cari Produk..." class="w-full border rounded px-2 mb-1 searchProduk" oninput="filterProdukDropdownCustom(this)" />
      <div class="produkDropdown hidden border bg-white shadow rounded max-h-40 overflow-y-auto z-50 absolute w-48"></div>
      <select class="itemNama hidden">
        ${produkList.map((p) => `<option value="${p.product_id}" data-harga="${p.sale_price}" data-nama="${p.product}">${p.product}</option>`).join("")}
      </select>
    </td>
    <td class="px-3 py-2 border text-right"><input type="number" class="w-full border rounded px-2 text-right itemQty" value="1" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right"><input type="text" class="w-full border rounded px-2 text-right itemHarga" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right itemBerat hidden">0</td>
    <td class="px-3 py-2 border text-right"><input type="text" class="w-full border rounded px-2 text-right itemDiskon" oninput="recalculateTotal()" /></td>
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

  const filtered = produkList.filter((p) =>
    p.product.toLowerCase().includes(value),
  );
  if (filtered.length === 0) return dropdown.classList.add("hidden");

  filtered.forEach((p) => {
    const div = document.createElement("div");
    div.className = "px-3 py-2 hover:bg-gray-200 cursor-pointer text-sm";
    div.textContent = p.product;
    div.onclick = () => {
      inputEl.value = p.product;
      // inputEl.closest("tr").querySelector(".itemHarga").value = p.sale_price.toLocaleString('id-ID');
      const tr = inputEl.closest("tr");
      tr.querySelector(".itemHarga").value =
        p.sale_price.toLocaleString("id-ID");
      tr.querySelector(".itemBerat").innerText = p.weight || 0;
      const diskonProduk = p.discount_price || p.discount || 0;
      tr.querySelector(".itemDiskon").value = diskonProduk.toLocaleString("id-ID");
      const opt = Array.from(select.options).find(
        (o) => o.value == p.product_id,
      );
      if (opt) select.value = opt.value;
      dropdown.classList.add("hidden");
      recalculateTotal();
    };
    dropdown.appendChild(div);
  });

  dropdown.classList.remove("hidden");
}
function updateBadge(elementId, config) {
  const badge = document.getElementById(elementId);
  if (!badge) return;

  badge.className = 'px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider';

  if (config) {
    badge.textContent = config.text;
    badge.classList.add(...config.classes);
  } else {
    badge.classList.add('hidden');
  }
}

// Variabel penanda mana yang terakhir diedit
lastEditedDiscount = 'nominal'; 

function handleInputPersen() {
  lastEditedDiscount = 'persen';
  recalculateTotal();
}

function handleInputNominal(el) {
  lastEditedDiscount = 'nominal';
  
  // Format nominal menjadi format ribuan yang formal secara otomatis
  let raw = el.value.replace(/[^\d]/g, "");
  if (!raw) {
    el.value = "";
  } else {
    el.value = parseInt(raw, 10).toLocaleString("id-ID");
  }
  
  recalculateTotal();
}

function recalculateTotal() {
  const rows = document.querySelectorAll("#tabelItem tr");
  
  let subtotalKotor = 0; 
  let totalDiskonItem = 0; 
  let weight = 0;

  rows.forEach((row) => {
    const qty = parseFloat(row.querySelector(".itemQty")?.value.replace(/[^\d]/g, "") || 0);
    const harga = parseFloat(row.querySelector(".itemHarga")?.value.replace(/[^\d]/g, "") || 0);
    const itemdiskon = parseFloat(row.querySelector(".itemDiskon")?.value.replace(/[^\d]/g, "") || 0);
    const berat = parseFloat(row.querySelector(".itemBerat")?.innerText.replace(/[^\d]/g, "") || 0);
    
    const subKotor = qty * harga; 
    
    subtotalKotor += subKotor;
    totalDiskonItem += itemdiskon; 
    weight += qty * berat;
  });

  const mp_admin = parseInt(document.getElementById("inputmp_admin")?.value.replace(/[^\d]/g, "") || 0);
  const shipping = parseInt(document.getElementById("inputShipping")?.value.replace(/[^\d]/g, "") || 0);
  
  // --- KALKULASI DISKON MEMBERSHIP DINAMIS ---
  // Dasar perhitungan diskon membership adalah subtotal yang sudah dikurangi diskon item
  const baseDiskon = subtotalKotor - totalDiskonItem; 
  
  let diskonPersen = parseFloat(document.getElementById("inputDiskonPersen")?.value || 0);
  let diskonNominal = parseInt(document.getElementById("inputDiskon")?.value.replace(/[^\d]/g, "") || 0);

  if (lastEditedDiscount === 'persen') {
    // Jika ngetik persen, hitung dan update value nominalnya
    diskonNominal = Math.round(baseDiskon * (diskonPersen / 100));
    const elDiskonNominal = document.getElementById("inputDiskon");
    if (elDiskonNominal) {
       elDiskonNominal.value = diskonNominal === 0 ? "0" : diskonNominal.toLocaleString("id-ID");
    }
  } else {
    // Jika ngetik nominal (atau jika user nambah produk di tabel), hitung dan update persennya
    if (baseDiskon > 0) {
      diskonPersen = (diskonNominal / baseDiskon) * 100;
      const elDiskonPersen = document.getElementById("inputDiskonPersen");
      if (elDiskonPersen) {
         // Dibulatkan maksimal 2 angka di belakang koma biar rapi
         elDiskonPersen.value = parseFloat(diskonPersen.toFixed(2));
      }
    } else {
      const elDiskonPersen = document.getElementById("inputDiskonPersen");
      if (elDiskonPersen) elDiskonPersen.value = 0;
    }
  }

  const totalDiskonSemua = totalDiskonItem + diskonNominal;

  // --- KALKULASI GRAND TOTAL ---
  const pajak = Math.round(0 * (subtotalKotor - totalDiskonSemua)); 
  const grandTotal = subtotalKotor - totalDiskonSemua + pajak + shipping + mp_admin;

  // --- INJECT KE UI RINGKASAN ---
  const elSubtotal = document.getElementById("subtotal");
  if(elSubtotal) elSubtotal.innerText = `${subtotalKotor.toLocaleString("id-ID")}`;
  
  const elDiskonItem = document.getElementById("diskonItem");
  if(elDiskonItem) elDiskonItem.innerText = `${totalDiskonItem.toLocaleString("id-ID")}`;
  
  const elDiskonMembership = document.getElementById("diskonMembership");
  if(elDiskonMembership) elDiskonMembership.innerText = `${diskonNominal.toLocaleString("id-ID")}`;
  
  const elPajak = document.getElementById("pajak");
  if(elPajak) elPajak.innerText = `${pajak.toLocaleString("id-ID")}`;
  
  const elMpAdmin = document.getElementById("mp_admin");
  if(elMpAdmin) elMpAdmin.innerText = `${mp_admin.toLocaleString("id-ID")}`;
  
  const elOngkir = document.getElementById("ongkir");
  if(elOngkir) elOngkir.innerText = `${shipping.toLocaleString("id-ID")}`;
  
  const elTotal = document.getElementById("total");
  if(elTotal) elTotal.innerText = `${grandTotal.toLocaleString("id-ID")}`;
  
  const elTotalBerat = document.getElementById("totalBerat");
  if(elTotalBerat) elTotalBerat.innerText = `${weight.toLocaleString("id-ID")} gr`;

  // --- SINKRONISASI SISA TAGIHAN SECARA LIVE ---
  const uangMasuk = window.totalSudahDibayar || 0;
  let sisaTagihanDinamis = grandTotal - uangMasuk;
  if (sisaTagihanDinamis < 0) sisaTagihanDinamis = 0; 

  const elTotalInvoice = document.getElementById("paymentTotalInvoice");
  const elSisaTagihan = document.getElementById("paymentRemaining");

  if (elTotalInvoice) elTotalInvoice.innerText = `Rp ${grandTotal.toLocaleString("id-ID")}`;
  if (elSisaTagihan) elSisaTagihan.innerText = `Rp ${sisaTagihanDinamis.toLocaleString("id-ID")}`;
}
function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  document.getElementById("tanggal").value = `${yyyy}-${mm}-${dd}`;
}

function formatNumberInputs() {
  document
    .querySelectorAll(
      ".itemHarga, .itemDiskon, #inputShipping, #inputmp_admin" 
    )
    .forEach((input) => {
      input.addEventListener("input", () => {
        const raw = input.value.replace(/[^\d]/g, "");
        if (!raw) {
          input.value = "";
          return;
        }
        input.value = parseInt(raw, 10).toLocaleString("id-ID");
        recalculateTotal();
      });
    });
}

async function submitInvoice() {
  try {
    const rows = document.querySelectorAll("#tabelItem tr");
    if (rows.length === 0)
      return Swal.fire(
        "Peringatan",
        "Mohon tambahkan minimal satu produk.",
        "warning",
      );

    let totalDiskonItem = 0; // Siapkan variabel penampung

    const sales_detail = Array.from(rows).map((row) => {
      const select = row.querySelector(".itemNama");
      const diskon_produk = parseInt(row.querySelector(".itemDiskon")?.value.replace(/[^\d]/g, "") || 0);
      
      totalDiskonItem += diskon_produk; // Akumulasi total diskon

      return {
        product_id: parseInt(select.value),
        quantity: parseInt(row.querySelector(".itemQty").value || 0),
        sale_price: parseInt(row.querySelector(".itemHarga").value.replace(/[^\d]/g, "") || 0),
        discount_price: diskon_produk,
      };
    });

    // Ambil value dari form sebelum menyusun body
    const diskonMembershipPersen = parseFloat(document.getElementById("inputDiskonPersen").value || 0);
    const diskonMembershipNominal = parseInt(document.getElementById("inputDiskon").value.replace(/[^\d]/g, "") || 0);

    const body = {
      owner_id: owner_id,
      user_id: user_id,
      date: document.getElementById("tanggal").value,
      customer_id: parseInt(document.getElementById("klien_id").value),
      contact_id: parseInt(document.getElementById("contact_id").value) || 0,
      salesman_id: parseInt(document.getElementById("salesman").value || 0),
      type_id: parseInt(document.getElementById("selectType").value || 0),
      
      // DISKON DAFTAR ITEM
      discount_nominal: totalDiskonItem, 
      
      // PAJAK
      tax_percent: 0,
      tax: 0,
      
      // DISKON MEMBERSHIP (SESUAI PAYLOAD)
      membership_discount_percent: diskonMembershipPersen,
      membership_discount_nominal: diskonMembershipNominal, // Typo disengaja menyesuaikan API
      
      // BIAYA LAIN-LAIN
      courier_id: parseInt(document.getElementById("selectCourier").value || 0),
      courier_note: document.getElementById("courierNote").value,
      shipping: parseInt(document.getElementById("inputShipping").value.replace(/[^\d]/g, "") || 0),
      "mp_admin": parseInt(document.getElementById("inputmp_admin").value.replace(/[^\d]/g, "") || 0), // Memakai strip menyesuaikan API
      
      // KETERANGAN
      catatan: document.getElementById("catatan").value,
      syaratketentuan: document.getElementById("syaratketentuan").value,
      termpayment: document.getElementById("termpayment").value,
      
      sales_detail: sales_detail,
    };

    const res = await fetch(`${baseUrl}/add/sales_msi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (String(json.success) === "true") {
      Swal.fire(
        "Sukses",
        json.message || "Data successfully added",
        "success",
      ).then(() => loadModuleContent("sales"));
    } else {
      Swal.fire("Gagal", json.message || "Gagal menyimpan data.", "error");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Terjadi kesalahan sistem.", "error");
  }
}

async function updateInvoice() {
  try {
    const konfirmasi = await Swal.fire({
      title: "Update Data?",
      text: "Simpan perubahan faktur MSI ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✅ Ya, Update",
      cancelButtonText: "❌ Batal",
    });

    if (!konfirmasi.isConfirmed) return;

    const rows = document.querySelectorAll("#tabelItem tr");
    let totalDiskonItem = 0; // Siapkan variabel penampung

    const sales_detail = Array.from(rows).map((row) => {
      const select = row.querySelector(".itemNama");
      const diskon_produk = parseInt(row.querySelector(".itemDiskon")?.value.replace(/[^\d]/g, "") || 0);
      
      totalDiskonItem += diskon_produk; // Akumulasi total diskon

      return {
        product_id: parseInt(select.value),
        quantity: parseInt(row.querySelector(".itemQty").value || 0),
        sale_price: parseInt(row.querySelector(".itemHarga").value.replace(/[^\d]/g, "") || 0),
        discount_price: diskon_produk,
      };
    });

    // Ambil value dari form sebelum menyusun body
    const diskonMembershipPersen = parseFloat(document.getElementById("inputDiskonPersen").value || 0);
    const diskonMembershipNominal = parseInt(document.getElementById("inputDiskon").value.replace(/[^\d]/g, "") || 0);

    const body = {
      owner_id: owner_id,
      user_id: user_id,
      date: document.getElementById("tanggal").value,
      customer_id: parseInt(document.getElementById("klien_id").value),
      contact_id: parseInt(document.getElementById("contact_id").value) || 0,
      salesman_id: parseInt(document.getElementById("salesman").value || 0),
      type_id: parseInt(document.getElementById("selectType").value || 0),
      
      // DISKON DAFTAR ITEM
      discount_nominal: totalDiskonItem, 
      
      // PAJAK
      tax_percent: 0,
      tax: 0,
      
      // DISKON MEMBERSHIP (SESUAI PAYLOAD)
      membership_discount_percent: diskonMembershipPersen,
      membership_discount_nominal: diskonMembershipNominal, // Typo disengaja menyesuaikan API
      
      // BIAYA LAIN-LAIN
      courier_id: parseInt(document.getElementById("selectCourier").value || 0),
      courier_note: document.getElementById("courierNote").value,
      shipping: parseInt(document.getElementById("inputShipping").value.replace(/[^\d]/g, "") || 0),
      "mp_admin": parseInt(document.getElementById("inputmp_admin").value.replace(/[^\d]/g, "") || 0), // Memakai strip menyesuaikan API
      
      // KETERANGAN
      catatan: document.getElementById("catatan").value,
      syaratketentuan: document.getElementById("syaratketentuan").value,
      termpayment: document.getElementById("termpayment").value,
      
      sales_detail: sales_detail,
    };
    // PERBAIKAN: Gunakan metode PUT dan pastikan ID faktur ada di URL
    const res = await fetch(`${baseUrl}/update/sales_msi/${window.detail_id}`, {
      method: "PUT", // Gunakan PUT untuk update
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    // Sesuaikan pengecekan sukses (MSI biasanya menggunakan json.success)
    if (json.success || (json.data && json.data.success)) {
      Swal.fire("Sukses", "Data successfully updated", "success").then(() =>
        loadModuleContent("sales"),
      );
    } else {
      Swal.fire("Gagal", json.message || "Gagal memperbarui data.", "error");
    }
  } catch (error) {
    console.error("Error Update:", error);
    Swal.fire("Error", "Terjadi kesalahan sistem saat update.", "error");
  }
}
async function loadCourierList() {
  try {
    const res = await fetch(`${baseUrl}/list/courier/${owner_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const result = await res.json();
    const list = result.listData || [];

    const courierSelect = document.getElementById("selectCourier");
    courierSelect.innerHTML = '<option value="">-- Pilih Kurir --</option>';

    list.forEach((courier) => {
      const option = document.createElement("option");
      option.value = courier.courier_id; // atau courier.id jika ingin ID
      option.textContent = courier.courier;
      courierSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Gagal memuat daftar kurir:", error);
  }
}

async function loadTypeOrder() {
  try {
    const res = await fetch(`${baseUrl}/list/sales_type/${owner_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const result = await res.json();
    const list = result.listData || [];
    console.log("sales type : ", list);

    const courierSelect = document.getElementById("selectType");
    courierSelect.innerHTML =
      '<option value="">-- Pilih Type Penjualan --</option>';

    list.forEach((sales) => {
      const option = document.createElement("option");
      option.value = sales.type_id; // atau courier.id jika ingin ID
      option.textContent = sales.sales_type;
      courierSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Gagal memuat daftar kurir:", error);
  }
}

function handleCourierChange() {
  const selected = document.getElementById("selectCourier").value;
  console.log("Kurir dipilih:", selected);
  // kamu bisa lanjutkan fetch tarif berdasarkan berat dan kota jika perlu
}

function loadDetailSales(Id, Detail) {
  window.detail_id = Id;
  window.detail_desc = Detail;

  // 1. Ganti ke endpoint MSI sesuai struktur terbaru
  fetch(`${baseUrl}/detail/sales_msi/${Id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  })
    .then((res) => res.json())
    .then(({ detail }) => {
      // Pastikan loadProdukList selesai agar dropdown produk di tabel tidak kosong
      return loadProdukList(detail.customer_id).then(() => detail);
    })
    .then((detail) => {
      // --- LOGIKA TOGGLE TOMBOL ---
      const btnSimpan = document.getElementById("btnSimpan");
      const btnUpdate = document.getElementById("btnUpdate");

      if (btnSimpan && btnUpdate) {
        btnSimpan.classList.add("hidden"); // Sembunyikan tombol Simpan
        btnUpdate.classList.remove("hidden"); // Tampilkan tombol Update
      }

      // --- PENGISIAN FORM IDENTITAS ---
      document.getElementById("formTitle").innerText = `UPDATE FAKTUR ${detail_desc}`;
      document.getElementById("tanggal").value = formatDateForInput(detail.date);
      document.getElementById("klien").value = detail.customer || "";
      document.getElementById("klien_id").value = detail.customer_id || "";

      // Pengecekan aman untuk customerList jika belum termuat sepenuhnya
      const safeCustomerList = typeof customerList !== 'undefined' ? customerList : [];
      const mitraData = safeCustomerList.find((c) => c.pelanggan_id == detail.customer_id);
      const mem_id = detail.membership_id || (mitraData ? mitraData.membership_id : null);
      
      // Setup Badge Membership
      let memConfig = null;
      if (mem_id == 1) memConfig = { text: 'FREE', classes: ['bg-gray-200', 'text-gray-600'] };
      else if (mem_id == 2) memConfig = { text: 'VIP', classes: ['bg-yellow-400', 'text-yellow-900'] };
      updateBadge('membershipBadge', memConfig);

      // Setup Badge WhatsApp (Gunakan String() agar .trim() tidak error jika nilainya angka)
      const waNumber = detail.whatsapp || detail.phone;
      if (waNumber && String(waNumber).trim() !== '') {
          updateBadge('waBadge', memConfig);
      } else {
          updateBadge('waBadge', null);
      }

      // 2. Sinkronisasi Dropdown PIC
      // Pastikan mitraData dan array customer_pic tersedia sebelum diproses
      if (mitraData && mitraData.customer_pic) {
        loadPicToSelect(mitraData.customer_pic, mitraData);
        document.getElementById("selectPic").value = detail.contact_id || "";
      }

      // 3. Set Field Detail
      document.getElementById("contact_id").value = detail.contact_id || 0;
      document.getElementById("no_hp").value = waNumber || ""; // Gunakan variabel yang sudah divalidasi
      document.getElementById("alamat").value = detail.address || "";
      document.getElementById("city").value = detail.region_name || "";

      // 4. Set Field Finansial & Dropdown Lainnya
// Tarik data persentase dan langsung masukkan ke field
document.getElementById("inputDiskonPersen").value = detail.membership_discount_percent || 0;

// Tarik data nominal dan format ke dalam bentuk ribuan
document.getElementById("inputDiskon").value = (detail.membership_discount_nominal || 0).toLocaleString("id-ID");

document.getElementById("inputShipping").value = (detail.shipping || 0).toLocaleString("id-ID");
document.getElementById("inputmp_admin").value = (detail.mp_admin || 0).toLocaleString("id-ID");

      document.getElementById("salesman").value = detail.salesman_id || "";
      document.getElementById("selectType").value = detail.type_id || "";
      document.getElementById("selectCourier").value = detail.courier_id || "";
      document.getElementById("courierNote").value = detail.courier_note || "";
      document.getElementById("catatan").value = detail.catatan || "";
      document.getElementById("syaratketentuan").value = detail.syaratketentuan || "";
      document.getElementById("termpayment").value = detail.termpayment || "";

      // 5. Load Tabel Item Produk
      const tbody = document.getElementById("tabelItem");
      tbody.innerHTML = "";
      
      // Pastikan sales_detail ada dan benar-benar sebuah Array
      if (detail.sales_detail && Array.isArray(detail.sales_detail)) {
        detail.sales_detail.forEach((item) => {
          tambahItem();
          const row = tbody.lastElementChild;
          if (row) {
            row.querySelector(".searchProduk").value = item.product || "";
            row.querySelector(".itemNama").value = item.product_id || "";
            row.querySelector(".itemQty").value = item.qty || 1;
            row.querySelector(".itemHarga").value = (item.unit_price || 0).toLocaleString("id-ID");
            row.querySelector(".itemBerat").innerText = item.weight || 0;
            row.querySelector(".itemDiskon").value = (item.discount_price || 0).toLocaleString("id-ID");
          }
        });
      }

      recalculateTotal();
    })
    .catch((err) => {
      console.error("Gagal load detail MSI:", err);
      // Memastikan SweetAlert muncul tepat di tengah dengan format standar
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat detail faktur'
      });
    });
}
function formatDateForInput(dateStr) {
  const [d, m, y] = dateStr.split("/");
  return `${y}-${m}-${d}`;
}

async function loadPaymentDetail(detail_id) {
  try {
    const res = await fetch(
      `${baseUrl}/list/sales_receipt/${owner_id}/${detail_id}`,
      {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      },
    );
    const { totalInvoice, totalReceipt, totalRemainingPayment, listData } =
      await res.json();
    
    window.totalSudahDibayar = totalReceipt || 0;

    // Inject Ringkasan Pembayaran
    document.getElementById("paymentTotalInvoice").innerText =
      `Rp ${totalInvoice.toLocaleString("id-ID")}`;
    document.getElementById("paymentTotalPaid").innerText =
      `Rp ${totalReceipt.toLocaleString("id-ID")}`;
    document.getElementById("paymentRemaining").innerText =
      `Rp ${totalRemainingPayment.toLocaleString("id-ID")}`;

    // Inject List Pembayaran
    const wrapper = document.getElementById("listPembayaran");
    wrapper.innerHTML = "";

    if (!listData || listData.length === 0) {
      wrapper.innerHTML =
        '<p class="text-sm text-gray-500">Belum ada pembayaran.</p>';
      return;
    }

    listData.forEach((item) => {
      const div = document.createElement("div");
      div.className = "border p-3 rounded text-sm bg-white";
      div.innerHTML = `
        <div class="flex justify-between">
          <div class="font-semibold">${item.account}</div>
          <div class="text-gray-500 text-sm">${item.date}</div>
        </div>
        <div class="flex justify-between mt-1">
          <div class="text-gray-600">${item.notes || "-"}</div>
          <div class="font-bold text-green-700">Rp ${item.nominal.toLocaleString("id-ID")}</div>
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
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const result = await response.json();
    const data = result?.detail;
    if (!data) throw new Error("Data paket tidak ditemukan");

    // Tampilkan pilihan aksi ke user
    const { isConfirmed, dismiss } = await Swal.fire({
      title: "Cetak Faktur Penjualan",
      text: "Pilih metode pencetakan:",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Download PDF",
      cancelButtonText: "Print Langsung",
      reverseButtons: true,
    });

    if (isConfirmed) {
      const url = `print_faktur.html?id=${invoice_id}`;
      // === Download PDF (via packing_print.html di iframe) ===
      Swal.fire({
        title: "Menyiapkan PDF...",
        html: "File akan diunduh otomatis.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();

          const iframe = document.createElement("iframe");
          iframe.src = url + "&mode=download";
          iframe.style.width = "0";
          iframe.style.height = "0";
          iframe.style.border = "none";
          document.body.appendChild(iframe);

          setTimeout(() => {
            Swal.close();
            Swal.fire(
              "Berhasil",
              "Faktur Penjualan berhasil diunduh.",
              "success",
            );
          }, 3000);
        },
      });
    } else if (dismiss === Swal.DismissReason.cancel) {
      // === Print Langsung (open tab) ===
      window.open(`print_faktur.html?id=${invoice_id}`, "_blank");
    }
  } catch (error) {
    Swal.fire({
      title: "Gagal",
      text: error.message,
      icon: "error",
    });
  }
}

async function sendWhatsAppInvoice() {
  if (!window.detail_id) return alert("Invoice belum tersedia.");

  try {
    const res = await fetch(`${baseUrl}/detail/sales/${window.detail_id}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });

    const { detail } = await res.json();
    const {
      customer,
      no_inv,
      date,
      sales_detail,
      discount_nominal,       // Diskon Item
      discount_membership,    // Diskon Membership (Tambahkan variabel ini dari destructuring)
      shipping,
      terms,
      term_payment,
      notes,
    } = detail;

    // Cari nomor WA dari customerList
    const klien = customerList.find(
      (c) => c.pelanggan_id == detail.customer_id,
    );
    const wa = klien?.whatsapp?.replace(/\D/g, "").replace(/^0/, "62");
    if (!wa) return alert("❌ Nomor WhatsApp klien tidak ditemukan.");

    // Format daftar produk
    let produkList = "";
    let subtotal = 0;
    sales_detail.forEach((item, i) => {
      const qty = item.qty;
      const harga = item.unit_price;
      const total = qty * harga;
      subtotal += total;
      produkList += `${i + 1}. ${item.product} x${qty} @Rp${harga.toLocaleString("id-ID")} = Rp${total.toLocaleString("id-ID")}\n`;
    });

   const pajak = Math.round(subtotal * 0);
    // Hitungan total dikurangi kedua jenis diskon
    const total = subtotal - (discount_nominal || 0) - (discount_membership || 0) + pajak + shipping;

    // Susun pesan WA
    let pesan = `Hallo ${customer},\n\nBerikut tagihan untuk invoice *${no_inv}* (tgl: ${date}):\n\n`;
    pesan += produkList + "\n";
    pesan += `Subtotal: Rp${subtotal.toLocaleString("id-ID")}\n`;
    
    // Tampilkan rincian diskon jika ada isinya
    if (discount_nominal) pesan += `Diskon Item: -Rp${discount_nominal.toLocaleString("id-ID")}\n`;
    if (discount_membership) pesan += `Diskon Membership: -Rp${discount_membership.toLocaleString("id-ID")}\n`;
    
    pesan += `Pajak (0%): Rp${pajak.toLocaleString("id-ID")}\n`;
    if (shipping) pesan += `Ongkir: Rp${shipping.toLocaleString("id-ID")}\n`;
    pesan += `*Total Tagihan: Rp${total.toLocaleString("id-ID")}*\n\n`;
    if (notes) pesan += `📝 *Catatan:*\n${notes}\n\n`;
    if (terms) pesan += `📌 *Syarat & Ketentuan:*\n${terms}\n\n`;
    if (term_payment) pesan += `💰 *Term of Payment:*\n${term_payment}\n\n`;
    pesan += `Silakan lakukan pembayaran sesuai ketentuan. Terima kasih 🙏`;

    // Kirim via WA
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("❌ Gagal kirim WA:", err);
    alert("Gagal mengirim pesan WhatsApp.");
  }
}
