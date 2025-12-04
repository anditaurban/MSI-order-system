pagemodule = "Warehouse";
colSpanCount = 9;
setDataType("werehouse_pic");

// --- BAGIAN INISIALISASI (Paling Atas Script) ---

if (window.detail_id && window.detail_desc) {
  // === MODE UPDATE ===
  loadDetail(detail_id, detail_desc);
  document.getElementById("addButton").classList.add("hidden");

  // Pastikan Tab PIC muncul saat mode edit
  const tabPic = document.querySelector('.tab-link[data-tab="detail"]'); // Sesuaikan data-tab
  if (tabPic) tabPic.classList.remove("hidden");
} else {
  // === MODE TAMBAH ===
  document.getElementById("updateButton").classList.add("hidden");

  loadTipeGudang();
  loadDropdownCall();

  formattedToday =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  // --- [BARU] SEMBUNYIKAN TAB PIC ---
  // Kita cari elemen tombol tab yang mengarah ke PIC (biasanya data-tab="pic" atau urutan ke-2)
  const tabPicBtn = document.querySelector('.tab-link[data-tab="detail"]');

  if (tabPicBtn) {
    tabPicBtn.classList.add("hidden"); // Tambahkan class hidden (Tailwind)
    // Atau gunakan style manual: tabPicBtn.style.display = 'none';
  }
}

function switchTab(tabId) {
  // Hide all tab contents
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.add("hidden"));

  // Remove active styling
  document.querySelectorAll(".tab-link").forEach((btn) => {
    btn.classList.remove("bg-blue-100", "text-blue-600", "font-semibold");
    btn.classList.add("text-gray-600");
  });

  // Show selected tab
  document.getElementById(`tab-${tabId}`).classList.remove("hidden");

  // Set active tab link
  document
    .querySelector(`.tab-link[data-tab="${tabId}"]`)
    .classList.add("bg-blue-100", "text-blue-600", "font-semibold");
  document
    .querySelector(`.tab-link[data-tab="${tabId}"]`)
    .classList.remove("text-gray-600");
}

async function loadDropdown(selectId, apiUrl, valueField, labelField) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">Loading...</option>`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log(`Data untuk ${selectId}:`, result);
    const listData = result.listData;

    select.innerHTML = `<option value="">Pilih...</option>`;

    if (Array.isArray(listData)) {
      listData.forEach((item) => {
        const option = document.createElement("option");
        option.value = item[valueField];
        option.textContent = item[labelField];
        select.appendChild(option);
      });
    } else {
      console.error("Format listData tidak sesuai:", listData);
    }
  } catch (error) {
    console.error(`Gagal memuat data untuk ${selectId}:`, error);
    select.innerHTML = `<option value="">Gagal memuat data</option>`;
  }
}
// Panggil fungsi ini secara manual untuk mengetes
// --- 1. FUNGSI MANUAL LOAD TIPE GUDANG ---
async function loadTipeGudang() {
  const select = document.getElementById("formType");
  // Reset dulu
  select.innerHTML = '<option value="">Loading...</option>';

  try {
    // Pastikan owner_id sudah ada nilainya di variable global
    const url = `${baseUrl}/list/werehouse_type/${owner_id}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log("List Tipe Gudang:", result); // Cek console untuk debug

    if (result.listData && Array.isArray(result.listData)) {
      let options = '<option value="">-- Pilih Tipe --</option>';

      result.listData.forEach((item) => {
        // Value = type_id, Label = werehouse_type
        options += `<option value="${item.type_id}">${item.werehouse_type}</option>`;
      });

      select.innerHTML = options;
    } else {
      select.innerHTML = '<option value="">Data kosong</option>';
    }
  } catch (error) {
    console.error("Gagal load tipe gudang:", error);
    select.innerHTML = '<option value="">Gagal memuat</option>';
  }
}

// --- PENTING: PANGGIL FUNGSI INI DI BAGIAN INISIALISASI ---
// Panggil ini di baris-baris awal script (setelah deklarasi variable owner_id)

// --- 2. UPDATE LOAD DETAIL ---
async function loadDetail(Id, Detail) {
  document.getElementById("formTitle").innerText = `FORM UPDATE GUDANG`;
  window.detail_id = Id;
  window.detail_desc = Detail;

  await loadTipeGudang();

  fetch(`${baseUrl}/detail/werehouse/${Id}?_=${Date.now()}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  })
    .then((res) => res.json())
    .then(async ({ detail }) => {
      console.log("Data Detail:", detail);

      // Mapping Standard
      document.getElementById("formID").value = detail.werehouse_code || "";
      document.getElementById("formNama").value = detail.werehouse || "";
      document.getElementById("formPhone").value = detail.phone || "";
      document.getElementById("formAlamat").value = detail.address || "";

      // [BARU] Set Tipe Gudang
      // Kita kasih delay sedikit jaga-jaga kalau dropdown belum selesai loading
      setTimeout(() => {
        document.getElementById("formType").value = detail.type_id || "";
      }, 500);

      // Mapping Wilayah
      document.getElementById("formregion_ID").value = detail.region_id || "";
      document.getElementById("cityInput").value = detail.region_name || "";

      // Parsing String Wilayah
      if (detail.region_name) {
        const parts = detail.region_name.split(",").map((s) => s.trim());
        if (parts.length >= 3) {
          document.getElementById("formKelurahan").value = parts[0] || "";
          document.getElementById("formKecamatan").value = parts[1] || "";
          document.getElementById("formKota").value = parts[2] || "";
          if (parts[3]) {
            const lastPart = parts[3];
            const lastSpaceIndex = lastPart.lastIndexOf(" ");
            if (lastSpaceIndex !== -1) {
              document.getElementById("formProvinsi").value =
                lastPart.substring(0, lastSpaceIndex);
              document.getElementById("formPOS").value = lastPart.substring(
                lastSpaceIndex + 1
              );
            } else {
              document.getElementById("formProvinsi").value = lastPart;
            }
          }
        }
      }
    })
    .catch((err) => console.error("Gagal load detail:", err));
}

async function loadKategoriOptions(Id, selectedIds = []) {
  try {
    const res = await fetch(`${baseUrl}/list/business_category/${owner_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const result = await res.json();
    const kategoriList = result.listData || [];

    const container = document.getElementById("kategoriList");
    const countDisplay = document.getElementById("selectedCount");
    const searchInput = document.getElementById("searchKategori");

    container.innerHTML = "";
    countDisplay.textContent = `0 kategori dipilih`;

    // Pisahkan yang terpilih dan tidak terpilih
    const selectedItems = kategoriList.filter((item) =>
      selectedIds.includes(item.business_category_id)
    );
    const unselectedItems = kategoriList.filter(
      (item) => !selectedIds.includes(item.business_category_id)
    );
    const sortedList = [...selectedItems, ...unselectedItems];

    sortedList.forEach((item) => {
      const checkboxWrapper = document.createElement("label");
      checkboxWrapper.className =
        "flex items-start gap-2 p-2 border rounded hover:bg-gray-100 kategori-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "kategori";
      checkbox.value = item.business_category_id;
      checkbox.className = "mt-1";

      // Jika termasuk yang dipilih
      if (selectedIds.includes(item.business_category_id)) {
        checkbox.checked = true;
        checkboxWrapper.classList.add("bg-green-100"); // Warna hijau
      }

      const labelText = document.createElement("div");
      labelText.innerHTML = `<strong>${
        item.business_category
      }</strong><br><small>${item.description || ""}</small>`;

      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(labelText);
      container.appendChild(checkboxWrapper);

      checkbox.addEventListener("change", () => updateSelectedCount());

      checkboxWrapper.dataset.category = `${item.business_category} ${
        item.description || ""
      }`.toLowerCase();
    });

    function updateSelectedCount() {
      const selected = container.querySelectorAll(
        'input[name="kategori"]:checked'
      ).length;
      countDisplay.textContent = `${selected} kategori dipilih`;
    }

    // Inisialisasi count awal
    updateSelectedCount();

    // Pencarian
    searchInput.addEventListener("input", function () {
      const keyword = this.value.toLowerCase();
      const items = container.querySelectorAll(".kategori-item");

      items.forEach((item) => {
        const text = item.dataset.category;
        item.style.display = text.includes(keyword) ? "flex" : "none";
      });
    });
  } catch (err) {
    console.error("Gagal load kategori:", err);
  }
}

function formatMembershipID(id) {
  return "CUS-" + id.toString().padStart(5, "0");
}

// --- 3. UPDATE GET DATA PAYLOAD ---
function getDataPayload() {
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const payload = {
    owner_id: owner_id,
    region_id: getVal("formregion_ID"),

    // [BARU] Ambil nilai dari select manual tadi
    type_id: getVal("formType"),

    werehouse: getVal("formNama").toUpperCase(),
    werehouse_code: getVal("formID"),
    phone: getVal("formPhone"),
    address: getVal("formAlamat"),
    kelurahan: getVal("formKelurahan"),
    kecamatan: getVal("formKecamatan"),
    kota: getVal("formKota"),
    provinsi: getVal("formProvinsi"),
    kode_pos: getVal("formPOS"),
  };

  // Validasi
  if (!payload.werehouse || !payload.werehouse_code || !payload.phone) {
    Swal.fire({
      icon: "warning",
      title: "Data belum lengkap",
      text: "Nama, Kode, dan Telepon wajib diisi.",
    });
    return null;
  }

  // Validasi Tipe Gudang
  if (!payload.type_id) {
    Swal.fire({
      icon: "warning",
      title: "Tipe Gudang Kosong",
      text: "Silakan pilih tipe gudang.",
    });
    return null;
  }

  if (!payload.region_id) {
    Swal.fire({
      icon: "warning",
      title: "Wilayah belum dipilih",
      text: "Cari dan pilih wilayah dahulu.",
    });
    return null;
  }

  return payload;
}

async function submitData(method, id = "") {
  const payload = getDataPayload();
  if (!payload) return;

  const isCreate = method === "POST";
  const url = `${baseUrl}/${isCreate ? "add" : "update"}/werehouse${
    id ? "/" + id : ""
  }`;
  const actionText = isCreate ? "menyimpan" : "memperbarui";
  const successText = isCreate ? "ditambahkan" : "diperbarui";

  const confirm = await Swal.fire({
    icon: "question",
    title: isCreate ? "Simpan Data?" : "Perbarui Data?",
    text: `Apakah Anda yakin ingin ${actionText} data pelanggan ini?`,
    showCancelButton: true,
    confirmButtonText: `Ya, ${isCreate ? "simpan" : "perbarui"}`,
    cancelButtonText: "Batal",
  });

  if (!confirm.isConfirmed) return;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.data && result.data.id) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Data pelanggan berhasil ${successText}.`,
      });
      const { id } = result.data;
      loadModuleContent("warehouse");
    } else {
      throw new Error(result.message || `Gagal ${actionText} data pelanggan`);
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: error.message || `Terjadi kesalahan saat ${actionText} data.`,
    });
  }
}

async function createData() {
  await submitData("POST");
}

async function updateData() {
  await submitData("PUT", detail_id);
}

input = document.getElementById("cityInput");
resultList = document.getElementById("resultList");

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
    resultList.innerHTML = "";
    resultList.classList.add("hidden");
    return;
  }

  try {
    const url = `https://region.katib.cloud/table/region/${owner_id}/1?search=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer 0f4d99ae56bf938a9dc29d4f4dc499b919e44f4d3774cf2e5c7b9f5395d05fc6`,
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const results = data.tableData || [];

    resultList.innerHTML = results.length
      ? results
          .map(
            (item) => `
          <li class="px-3 py-2 border-b hover:bg-gray-100 cursor-pointer"
              data-kelurahan="${item.kelurahan}"
              data-kecamatan="${item.kecamatan}"
              data-kota="${item.kota}"
              data-provinsi="${item.provinsi}"
              data-kodepos="${item.kode_pos}"
              data-region_id="${item.region_id}">
              ${item.kelurahan}, ${item.kecamatan}, ${item.kota}, ${item.provinsi} ${item.kode_pos}
          </li>`
          )
          .join("")
      : '<li class="px-3 py-2 text-gray-500">Tidak ditemukan</li>';

    resultList.classList.remove("hidden");

    // Tambahkan event listener untuk setiap <li>
    resultList.querySelectorAll("li[data-kelurahan]").forEach((li) => {
      li.addEventListener("click", () => {
        document.getElementById("formregion_ID").value = li.dataset.region_id;
        document.getElementById("formKelurahan").value = li.dataset.kelurahan;
        document.getElementById("formKecamatan").value = li.dataset.kecamatan;
        document.getElementById("formKota").value = li.dataset.kota;
        document.getElementById("formProvinsi").value = li.dataset.provinsi;
        document.getElementById("formPOS").value = li.dataset.kodepos;

        input.value = li.textContent;
        resultList.classList.add("hidden");
      });
    });
  } catch (err) {
    console.error("Gagal ambil data wilayah:", err);
    resultList.innerHTML =
      '<li class="px-2 py-1 text-red-500">Gagal ambil data</li>';
    resultList.classList.remove("hidden");
  }
}

input.addEventListener(
  "input",
  debounce((e) => {
    searchCity(e.target.value);
  }, 400)
);

// ==========================================
// KONFIGURASI MODUL PIC (TAB 2)
// ==========================================

/** * 1. DEFINISI FORM MODAL (Global `formHtml`)
 * Form ini menyertakan logika pencarian wilayah (Region) persis seperti Tab 1.
 * Kita menggunakan ID yang berbeda (prefix 'pic_') agar tidak bentrok dengan form utama.
 */
formHtml = `
<form id="dataform" class="space-y-4" autocomplete="off">
  <input type="hidden" name="owner_id" value="${owner_id}">
  <input type="hidden" name="werehouse_id" id="modal_werehouse_id">
  <input type="hidden" name="region_id" id="pic_region_id">
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Nama PIC <span class="text-red-500">*</span></label>
      <input name="name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required placeholder="Nama Lengkap">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">No Telepon <span class="text-red-500">*</span></label>
      <input name="phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required placeholder="08...">
    </div>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Jalan</label>
    <textarea name="address" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Nama Jalan, No Rumah, RT/RW"></textarea>
  </div>

  <div class="relative">
    <label class="block text-sm font-medium text-gray-700 mb-1">Cari Wilayah (Auto-fill)</label>
    <div class="flex">
        <input type="text" id="picCityInput" placeholder="Ketik Kelurahan / Kecamatan..." 
            class="w-full border border-gray-300 rounded-l-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" oninput="handlePicRegionSearch(this.value)" />
        <span class="bg-gray-100 border border-l-0 border-gray-300 px-3 rounded-r-md text-sm flex items-center">🔎</span>
    </div>
    <ul id="picResultList" class="absolute z-50 w-full border bg-white mt-1 max-h-40 overflow-y-auto text-sm shadow-md rounded-md hidden"></ul>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kelurahan</label>
        <input type="text" name="kelurahan" id="pic_kelurahan" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
        <input type="text" name="kecamatan" id="pic_kecamatan" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kota/Kabupaten</label>
        <input type="text" name="kota" id="pic_kota" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
        <input type="text" name="provinsi" id="pic_provinsi" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Kode POS</label>
        <input type="text" name="kode_pos" id="pic_kodepos" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>
  </div>
</form>
`;

/**
 * 2. TEMPLATE BARIS TABEL (Row Template)
 * Menampilkan data sesuai response API List.
 */
window.rowTemplate = function (item, index) {
  // Cek status active
  const isActive = item.status_active === "on";

  return `
    <td class="px-4 py-3 border-b align-top font-medium">${
      item.name || "-"
    }</td>
    <td class="px-4 py-3 border-b align-top">${item.phone || "-"}</td>
    <td class="px-4 py-3 border-b align-top text-gray-600">
        <div>${item.address || ""}</div>
        <div class="text-xs text-blue-600 mt-1">
            ${item.region_name || ""}
        </div>
    </td>
    
    <td class="px-4 py-3 border-b align-top text-center relative">
       <div class="flex items-center justify-between gap-2">
          
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }">
            ${isActive ? "Active" : "Inactive"}
          </span>
       </div>

       <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
        
        <button onclick="event.stopPropagation(); editPicManual('${
          item.pic_id
        }')" 
   class="block w-full text-left px-4 py-2 hover:bg-gray-100">
   ✏️ Edit
</button>

        ${
          isActive
            ? `<button onclick="event.stopPropagation(); updateStatusPic('${item.pic_id}', 'off')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">🔴 Nonaktifkan</button>`
            : `<button onclick="event.stopPropagation(); updateStatusPic('${item.pic_id}', 'on')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-green-600">🟢 Aktifkan</button>`
        }

        <button onclick="event.stopPropagation(); handleDelete('${
          item.pic_id
        }')" 
          class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Hapus
        </button>
      </div>
    </td>
  `;
};

// --- FUNGSI MANUAL: EDIT PIC ---
async function editPicManual(picId) {
  try {
    // 1. Tampilkan Loading Dulu
    Swal.fire({
      title: "Memuat Data...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    // 2. Fetch Data Detail
    // Pastikan URL endpoint ini benar sesuai API kamu
    const url = `${baseUrl}/detail/werehouse_pic/${picId}`;
    console.log("Fetching manual:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log("Data Manual:", result);

    // Cek Data (Unwrap logic sederhana)
    const dataDetail = result.detail || result;

    if (!dataDetail || Object.keys(dataDetail).length === 0) {
      throw new Error("Data tidak ditemukan di server (Kosong).");
    }

    // 3. Tampilkan Form Modal
    Swal.fire({
      title: `Edit PIC: ${dataDetail.name || "Tanpa Nama"}`,
      html: formHtml, // Menggunakan variabel global formHtml yg sudah ada
      width: "650px",
      showCancelButton: true,
      confirmButtonText: "Simpan Perubahan",
      cancelButtonText: "Batal",
      didOpen: () => {
        // PENTING: Panggil fungsi fillFormData yang sudah kita perbaiki tadi
        fillFormData(result);
      },
      preConfirm: () => {
        // Ambil data dari form saat tombol Simpan ditekan
        const form = document.getElementById("dataform");
        if (!form) return null;

        // Manual get value untuk memastikan akurasi
        return {
          werehouse_id: document.getElementById("modal_werehouse_id").value,
          region_id: document.getElementById("pic_region_id").value,
          name: form.elements["name"].value,
          phone: form.elements["phone"].value,
          address: form.elements["address"].value,
          // Tambahan field wilayah jika API update membutuhkannya terpisah
          kelurahan: document.getElementById("pic_kelurahan").value,
          kecamatan: document.getElementById("pic_kecamatan").value,
          kota: document.getElementById("pic_kota").value,
          provinsi: document.getElementById("pic_provinsi").value,
          kode_pos: document.getElementById("pic_kodepos").value,
        };
      },
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        // Lanjut ke proses simpan
        saveUpdatePic(picId, res.value);
      }
    });
  } catch (error) {
    console.error(error);
    Swal.fire(
      "Gagal",
      error.message || "Terjadi kesalahan saat mengambil data",
      "error"
    );
  }
}

// --- FUNGSI SIMPAN UPDATE ---
async function saveUpdatePic(picId, payload) {
  // Validasi sederhana
  if (!payload.name || !payload.phone) {
    Swal.fire("Peringatan", "Nama dan Telepon wajib diisi!", "warning");
    return;
  }

  Swal.fire({
    title: "Menyimpan...",
    didOpen: () => Swal.showLoading(),
  });

  try {
    const url = `${baseUrl}/update/werehouse_pic/${picId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      Swal.fire("Berhasil", "Data PIC berhasil diperbarui", "success");

      // Reload Table jika fungsi tersedia
      if (typeof fetchAndUpdateData === "function" && window.detail_id) {
        fetchAndUpdateData(window.detail_id);
      }
    } else {
      throw new Error(result.message || "Gagal menyimpan data");
    }
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

async function updateStatusPic(picId, newStatus) {
  // 1. Tutup dropdown menu terlebih dahulu agar rapi
  document
    .querySelectorAll(".dropdown-content")
    .forEach((el) => el.classList.add("hidden"));

  // 2. Tentukan teks aksi untuk pesan konfirmasi
  const actionText = newStatus === "on" ? "mengaktifkan" : "menonaktifkan";

  // 3. Tampilkan Alert Konfirmasi
  const result = await Swal.fire({
    title: `Yakin ingin ${actionText} PIC ini?`,
    text: "Status akan diperbarui di sistem.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  });

  // 4. Jika user klik "Batal", berhenti di sini
  if (!result.isConfirmed) return;

  // 5. Jika user klik "Ya", lanjutkan proses update
  try {
    // Tampilkan loading saat proses fetch berjalan
    Swal.fire({
      title: "Memproses...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const url = `${baseUrl}/update/werehouse_pic_status/${picId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ status_active: newStatus }),
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: data.message || "Status berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      // Reload Data Table (pastikan window.detail_id tersedia)
      if (window.detail_id) {
        fetchAndUpdateData(window.detail_id);
      }
    } else {
      throw new Error(data.message || "Gagal update status");
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err.message || "Terjadi kesalahan saat menghubungi server",
    });
  }
}

async function fillFormData(data) {
  console.log("--- MAPPING DATA PIC ---", data);

  // 1. Buka Bungkus Data (Unwrap)
  // API kamu membungkus data dalam object "detail"
  let pic = data.detail || data;

  // Validasi data kosong
  if (!pic || Object.keys(pic).length === 0) {
    console.error("Data kosong, form tidak bisa diisi.");
    return;
  }

  // 2. Mapping ID Hidden
  const wId = document.getElementById("modal_werehouse_id");
  if (wId) wId.value = pic.werehouse_id || window.detail_id || "";

  const rId = document.getElementById("pic_region_id");
  if (rId) rId.value = pic.region_id || "";

  // 3. Mapping Input Text (Name, Phone, Address)
  // Menggunakan optional chaining dan string kosong sebagai fallback
  const form = document.getElementById("dataform");
  if (form) {
    if (form.elements["name"]) form.elements["name"].value = pic.name || "";
    if (form.elements["phone"]) form.elements["phone"].value = pic.phone || "";
    if (form.elements["address"])
      form.elements["address"].value = pic.address || "";
  }

  // 4. Mapping & Parsing Wilayah (Region)
  // Format API: "Kampung Bogor, Kepahiang, Kabupaten Kepahiang, Bengkulu 39372"
  if (pic.region_name) {
    // Isi input search agar user tau wilayahnya
    const cityInput = document.getElementById("picCityInput");
    if (cityInput) cityInput.value = pic.region_name;

    // Pecah string berdasarkan koma
    const parts = pic.region_name.split(",").map((s) => s.trim());

    // [0] Kelurahan -> Kampung Bogor
    if (parts[0]) document.getElementById("pic_kelurahan").value = parts[0];

    // [1] Kecamatan -> Kepahiang
    if (parts[1]) document.getElementById("pic_kecamatan").value = parts[1];

    // [2] Kota/Kab -> Kabupaten Kepahiang
    if (parts[2]) document.getElementById("pic_kota").value = parts[2];

    // [3] Provinsi & Kode Pos -> Bengkulu 39372
    if (parts[3]) {
      const lastPart = parts[3];
      // Pisahkan Angka (Kode Pos) dari Huruf (Provinsi)
      // Regex: Ambil semua angka di akhir string sebagai kode pos
      const zipMatch = lastPart.match(/\d+$/);

      if (zipMatch) {
        document.getElementById("pic_kodepos").value = zipMatch[0]; // 39372
        // Provinsi adalah sisa string setelah kode pos dihapus
        document.getElementById("pic_provinsi").value = lastPart
          .replace(zipMatch[0], "")
          .trim(); // Bengkulu
      } else {
        // Jika tidak ada angka, anggap semuanya provinsi
        document.getElementById("pic_provinsi").value = lastPart;
      }
    }
  }
}

/**
 * 4. LOGIKA PENCARIAN WILAYAH KHUSUS MODAL (PIC)
 * Fungsi ini dipanggil oninput dari #picCityInput di formHtml
 */

function handlePicRegionSearch(query) {
  const resultList = document.getElementById("picResultList");
  const input = document.getElementById("picCityInput");

  // Clear timer lama
  clearTimeout(picDebounceTimer.timer);

  if (!query || query.length < 3) {
    resultList.classList.add("hidden");
    return;
  }

  // Set timer baru (debounce 400ms)
  picDebounceTimer.timer = setTimeout(async () => {
    try {
      // Gunakan API Region yang sama dengan Tab 1
      const url = `https://region.katib.cloud/table/region/${owner_id}/1?search=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer 0f4d99ae56bf938a9dc29d4f4dc499b919e44f4d3774cf2e5c7b9f5395d05fc6`,
        },
      });
      const data = await res.json();
      const results = data.tableData || [];

      resultList.innerHTML = results.length
        ? results
            .map(
              (item) => `
                    <li class="px-3 py-2 border-b hover:bg-blue-50 cursor-pointer text-xs"
                        onclick="selectPicRegion(this)"
                        data-kelurahan="${item.kelurahan}"
                        data-kecamatan="${item.kecamatan}"
                        data-kota="${item.kota}"
                        data-provinsi="${item.provinsi}"
                        data-kodepos="${item.kode_pos}"
                        data-region_id="${item.region_id}">
                        <strong>${item.kelurahan}</strong>, ${item.kecamatan}, ${item.kota}, ${item.provinsi} (${item.kode_pos})
                    </li>
                  `
            )
            .join("")
        : '<li class="px-3 py-2 text-gray-500 text-xs">Tidak ditemukan</li>';

      resultList.classList.remove("hidden");
    } catch (err) {
      console.error("Gagal cari wilayah PIC:", err);
    }
  }, 400);
}

// Fungsi saat Item Wilayah di-klik (Global scope agar terbaca onclick string)
window.selectPicRegion = function (el) {
  // 1. Isi Hidden Fields
  document.getElementById("pic_region_id").value = el.dataset.region_id;
  document.getElementById("pic_kelurahan").value = el.dataset.kelurahan;
  document.getElementById("pic_kecamatan").value = el.dataset.kecamatan;
  document.getElementById("pic_kota").value = el.dataset.kota;
  document.getElementById("pic_provinsi").value = el.dataset.provinsi;
  document.getElementById("pic_kodepos").value = el.dataset.kodepos;

  // 2. Update Tampilan Input
  document.getElementById("picCityInput").value = el.innerText.trim();

  // 3. Sembunyikan list
  document.getElementById("picResultList").classList.add("hidden");
};

/**
 * 5. INTEGRASI TAB SWITCH & TOMBOL TAMBAH
 */
function loadDropdownCall() {
  // Tidak ada dropdown yang perlu dimuat untuk form kontak ini
  console.log("Tidak ada dropdown untuk dimuat.");
}
// Override fungsi openPicModal
function openPicModal() {
  if (!window.detail_id) {
    Swal.fire("Perhatian", "Simpan data Gudang terlebih dahulu.", "warning");
    return;
  }

  // Update formHtml agar modal_werehouse_id terisi ID Gudang saat ini
  // (Logic ini memastikan value hidden input selalu fresh)
  if (typeof showFormModal === "function") {
    showFormModal(); // Buka modal standar table.js

    // Set value werehouse_id secara manual setelah modal render
    setTimeout(() => {
      const wIdInput = document.getElementById("modal_werehouse_id");
      if (wIdInput) wIdInput.value = window.detail_id;
    }, 100);
  }
}

// Listener Tab Switch
document.querySelectorAll(".tab-link").forEach((btn) => {
  btn.addEventListener("click", function () {
    const tab = this.dataset.tab;

    if (tab === "detail") {
      if (!window.detail_id) return;

      // --- UBAH KONFIGURASI TABLE.JS KE MODUL PIC ---
      setDataType("werehouse_pic"); // Endpoint baru

      // Override properti global jika table.js mengizinkan
      // Jika menggunakan sistem module 'table.js' standar, ini akan mengubah endpoint fetch
      // List URL: {{baseUrl}}/table/werehouse_pic/{werehouseId}/1

      // Panggil fetch data baru dengan ID Gudang sebagai parameter
      if (typeof fetchAndUpdateData === "function") {
        fetchAndUpdateData(window.detail_id);
      }
    } else {
      // --- KEMBALI KE MODUL GUDANG (Jika user klik tab data) ---
      // setDataType("werehouse");
      // Opsional: jangan reload data gudang jika tidak perlu
    }
  });
});

var requiredFields = [
  { field: "name", message: "Nama PIC wajib diisi!" },
  { field: "phone", message: "Nomor Telepon wajib diisi!" },
  { field: "region_id", message: "Wilayah wajib dipilih dari pencarian!" }, // region_id dari hidden input
];

// 2. Fungsi Validasi yang dicari oleh table.js
window.validateFormData = function (data) {
  // Cek apakah requiredFields ada
  if (typeof requiredFields !== "undefined" && Array.isArray(requiredFields)) {
    for (let i = 0; i < requiredFields.length; i++) {
      let rule = requiredFields[i];

      // Cek apakah data kosong
      if (!data[rule.field] || data[rule.field].toString().trim() === "") {
        // Tampilkan error di SweetAlert (karena dipanggil di preConfirm)
        if (typeof Swal !== "undefined") {
          Swal.showValidationMessage(rule.message);
        } else {
          alert(rule.message);
        }
        return false; // Validasi Gagal
      }
    }
  }
  return true; // Validasi Sukses
};
window.updateStatusPic = updateStatusPic;
