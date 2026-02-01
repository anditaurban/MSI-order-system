pagemodule = "Product";
setDataType("product_werehouse");

// --- INISIALISASI ---
if (window.detail_id) {
  document.getElementById("addButton").classList.add("hidden");
  document.getElementById("updateButton").classList.remove("hidden");
  document.getElementById("formTitle").innerText = "UPDATE PRODUK GUDANG";

  // Load data detail untuk Edit
  loadDetailWerehouse(window.detail_id);
} else {
  document.getElementById("updateButton").classList.add("hidden");
  document.getElementById("addButton").classList.remove("hidden");
  setupPriceInputEvents();
  loadCategoryDropdown();
  loadBusinessCategoryList([]);

  // Load Dropdown Satuan (Unit)
  loadDropdown(
    "formUnit",
    `${baseUrl}/list/product_unit/${owner_id}`,
    "unit_id",
    "unit",
  );

  // Setup Pencarian Produk
  setupProductAutocomplete();
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

// --- FUNGSI LOAD DETAIL (EDIT MODE) ---
async function loadDetailWerehouse(id) {
  try {
    // A. Fetch Data Detail
    const response = await fetch(`${baseUrl}/detail/product_werehouse/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });

    const result = await response.json();
    const data = result.detail;

    if (!data) throw new Error("Data detail tidak ditemukan");

    // B. Set Hidden ID & Text Input
    document.getElementById("formProductId").value = data.product_id || "";
    document.getElementById("formProduct").value = data.product || "";
    document.getElementById("formSKU").value = data.productcode || "";
    document.getElementById("formDescription").value = data.description || "";

    // C. Set Angka & Uang (Format Ribuan)
    const formatNum = (num) => (num || 0).toLocaleString("id-ID");
    document.getElementById("formPrice").value = formatNum(data.sale_price);
    document.getElementById("formWholesalePrice").value = formatNum(
      data.wholesale_price,
    );
    document.getElementById("formBerat").value = formatNum(data.weight);
    document.getElementById("formMinStock").value = formatNum(
      data.minimum_stock,
    );
    document.getElementById("formMaxStock").value = formatNum(
      data.maximum_stock,
    );

    // D. Load & Set Dropdown Unit
    await loadDropdown(
      "formUnit",
      `${baseUrl}/list/product_unit/${owner_id}`,
      "unit_id",
      "unit",
    );
    document.getElementById("formUnit").value = data.unit_id;

    // E. Load & Set Kategori + Material (Berantai)
    // 1. Load Dropdown Kategori dulu dan set nilainya
    await loadCategoryDropdown(data.category_id);

    // 2. Jika ada kategori, load material sesuai kategori tsb
    if (data.category_id) {
      await loadMaterialDropdown(data.category_id, data.material_id);
    } else {
      document.getElementById("formMaterial").innerHTML =
        '<option value="">Pilih Material...</option>';
    }

    // F. Logic Pintar: Load Checkbox Kategori Bisnis
    // Mendeteksi apakah data dari server berupa Array Object, Array ID, atau String
    let savedCategories = [];

    if (
      Array.isArray(data.business_categories) &&
      data.business_categories.length > 0
    ) {
      if (typeof data.business_categories[0] === "object") {
        // Jika format: [{business_category_id: 1, ...}, ...]
        savedCategories = data.business_categories.map(
          (item) => item.business_category_id,
        );
      } else {
        // Jika format: [1, 2, 3]
        savedCategories = data.business_categories;
      }
    } else if (data.business_category_ids) {
      if (typeof data.business_category_ids === "string") {
        // Jika format string: "1,2,3"
        savedCategories = data.business_category_ids.split(",");
      } else if (Array.isArray(data.business_category_ids)) {
        savedCategories = data.business_category_ids;
      }
    }

    console.log("ID Kategori yang akan dicentang:", savedCategories);

    // Render checkbox dan centang yang sesuai
    await loadBusinessCategoryList(savedCategories);
  } catch (error) {
    console.error("Gagal load detail:", error);
    Swal.fire("Error", "Gagal memuat detail data.", "error");
  }
}

// --- FUNGSI PILIH PRODUK (AUTOCOMPLETE SEARCH) ---
async function selectProduct(item) {
  console.log("Produk Terpilih:", item);

  // A. Isi ID & Nama
  document.getElementById("formProductId").value = item.product_id;
  document.getElementById("formProduct").value = item.product;
  document.getElementById("formSKU").value = item.productcode || item.barcode;

  // B. Isi Harga & Berat (Auto Format)
  document.getElementById("formPrice").value = (
    item.sale_price || 0
  ).toLocaleString("id-ID");
  document.getElementById("formWholesalePrice").value = (
    item.wholesale_price || 0
  ).toLocaleString("id-ID");
  document.getElementById("formBerat").value = (
    item.weight || 0
  ).toLocaleString("id-ID");

  // C. Auto Select Unit
  if (item.unit_id) {
    document.getElementById("formUnit").value = item.unit_id;
  }

  // D. Handle Kategori & Material Otomatis
  const catSelect = document.getElementById("formCategoryId");

  if (item.category_id) {
    catSelect.value = item.category_id; // Pilih di dropdown
    await loadMaterialDropdown(item.category_id); // Load materialnya
  } else {
    catSelect.value = "";
    document.getElementById("formMaterial").innerHTML =
      '<option value="">Produk ini tidak memiliki kategori</option>';
  }
}
// --- FUNGSI SAAT PRODUK DIPILIH DARI SEARCH (ADD MODE) ---
async function selectProduct(item) {
  console.log("Produk Terpilih:", item);

  // 1. Simpan Product ID & Category ID (Hidden)
  document.getElementById("formProductId").value = item.product_id;
  document.getElementById("formCategoryId").value = item.category_id; // <--- INI KUNCINYA
  const catSelect = document.getElementById("formCategoryId");
  // 2. Isi Field Visual (Readonly/Editable)
  document.getElementById("formProduct").value = item.product;
  document.getElementById("formSKU").value = item.productcode || item.barcode;

  document.getElementById("formPrice").value = (
    item.sale_price || 0
  ).toLocaleString("id-ID");
  document.getElementById("formWholesalePrice").value = (
    item.wholesale_price || 0
  ).toLocaleString("id-ID");
  document.getElementById("formBerat").value = (
    item.weight || 0
  ).toLocaleString("id-ID");

  // 3. Auto Select Unit jika ada datanya
  if (item.unit_id) {
    document.getElementById("formUnit").value = item.unit_id;
  }

  // 4. LOAD MATERIAL OTOMATIS
  // Langsung panggil list material berdasarkan category_id dari produk yg dipilih
  if (item.category_id) {
    catSelect.value = item.category_id; // Set nilai dropdown
    // Load Material sesuai kategori produk ini
    await loadMaterialDropdown(item.category_id);
  } else {
    // Jaga-jaga jika produk master tidak punya kategori
    catSelect.value = "";
    document.getElementById("formMaterial").innerHTML =
      '<option value="">Produk ini tidak memiliki kategori</option>';
  }
}

// --- FUNGSI LOAD MATERIAL (Dependency Dropdown) ---
async function loadMaterialDropdown(categoryId, selectedMaterialId = null) {
  const select = document.getElementById("formMaterial");

  if (!categoryId) return;

  try {
    select.innerHTML = `<option value="">Loading Material...</option>`;
    select.disabled = true;

    // Fetch Material sesuai Kategori
    const res = await fetch(
      `${baseUrl}/list/product_category_material/${categoryId}`,
      { headers: { Authorization: `Bearer ${API_TOKEN}` } },
    );
    const result = await res.json();
    const listData = result.listData || [];

    select.innerHTML = `<option value="">Pilih Material...</option>`;

    if (listData.length === 0) {
      select.innerHTML = `<option value="">Tidak ada material untuk kategori ini</option>`;
    } else {
      listData.forEach((mat) => {
        const option = document.createElement("option");
        option.value = mat.material_id;
        option.textContent = mat.material;

        // Auto select jika mode edit
        if (selectedMaterialId && mat.material_id == selectedMaterialId) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    }
    select.disabled = false;
  } catch (err) {
    console.error(err);
    select.innerHTML = `<option value="">Gagal load material</option>`;
    select.disabled = false;
  }
}

// --- SISA KODE LAINNYA (Autocomplete, Submit, Helper Angka) TETAP SAMA ---
// (Pastikan fungsi setupProductAutocomplete, getDataPayload, submitData, dll tetap ada di bawah sini)

async function createData() {
  await submitData("POST");
}

// Dipanggil tombol "Update"
async function updateData() {
  // detail_id didapat dari global window.detail_id yang dipassing saat loadModuleContent
  await submitData("PUT", window.detail_id);
}

function setupProductAutocomplete() {
  const input = document.getElementById("formProduct");
  const resultsContainer = document.getElementById("productSearchResults");
  const hiddenId = document.getElementById("formProductId"); // Ambil hidden input ID
  let debounceTimeout;

  input.addEventListener("input", function () {
    const keyword = this.value.trim();

    // --- PERUBAHAN DI SINI ---
    // Setiap kali user mengetik/mengubah teks, reset ID menjadi 0/kosong
    // Ini menandakan bahwa input saat ini adalah "Teks Manual" bukan "Pilihan Database"
    hiddenId.value = "";
    // -------------------------

    clearTimeout(debounceTimeout);

    if (keyword.length < 2) {
      resultsContainer.classList.add("hidden");
      return;
    }

    debounceTimeout = setTimeout(async () => {
      // ... (Kode fetch pencarian tetap sama) ...
      const searchUrl = `${baseUrl}/table/product_input/${owner_id}/1?seach=${encodeURIComponent(keyword)}`;

      try {
        resultsContainer.innerHTML =
          '<div class="p-2 text-gray-500 text-sm">Mencari...</div>';
        resultsContainer.classList.remove("hidden");

        const response = await fetch(searchUrl, {
          method: "GET",
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        });

        const result = await response.json();
        // Filter hasil
        const products = (result.tableData || []).filter((item) =>
          item.product?.toLowerCase().includes(keyword.toLowerCase()),
        );

        resultsContainer.innerHTML = "";

        if (products.length === 0) {
          // Opsional: Beri tahu user bahwa ini akan jadi produk baru
          resultsContainer.innerHTML =
            '<div class="p-2 text-blue-600 text-sm fst-italic">Produk tidak ditemukan. Input akan disimpan sebagai data baru.</div>';
        } else {
          products.forEach((item) => {
            const div = document.createElement("div");
            div.className =
              "p-2 hover:bg-blue-50 cursor-pointer border-b last:border-0";
            div.innerHTML = `
              <div class="font-bold text-sm text-gray-800">${item.product}</div>
              <div class="text-xs text-gray-500">SKU: ${item.productcode}</div>
            `;

            div.addEventListener("click", () => {
              selectProduct(item);
              resultsContainer.classList.add("hidden");
            });

            resultsContainer.appendChild(div);
          });
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 500);
  });

  // ... (Event click outside tetap sama) ...
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.classList.add("hidden");
    }
  });
}

function getDataPayload() {
  // --- Helper Pengambil Nilai ---
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  // Helper Angka (Integer)
  const getInt = (id) => {
    let val = getVal(id).replace(/\./g, "");
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper Desimal (Float)
  const getFloat = (id) => {
    let val = getVal(id).replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // --- VALIDASI ID WAJIB DIHAPUS, GANTI VALIDASI NAMA ---
  // Kita tidak cek formProductId, tapi cek formProduct (Nama textnya)
  if (!getVal("formProduct")) {
    Swal.fire("Warning", "Nama Produk wajib diisi", "warning");
    return null;
  }

  // Jika kategori wajib dipilih (opsional, sesuaikan kebutuhan)
  if (!getVal("formCategoryId")) {
    Swal.fire("Warning", "Kategori wajib dipilih", "warning");
    return null;
  }

  // Ambil ID Kategori Bisnis
  const selectedBusinessCategories = getSelectedCategoryIds();

  // Ambil Werehouse ID
  const finalWerehouseId =
    typeof werehouse_id !== "undefined" && werehouse_id > 0 ? werehouse_id : 1;

  // --- LOGIKA PENENTUAN PRODUCT ID ---
  // Jika hidden ID kosong atau NaN, set jadi 0 (String atau Int sesuai backend)
  let rawProductId = getVal("formProductId");
  let finalProductId = rawProductId ? parseInt(rawProductId) : 0;

  // --- KONSTRUKSI PAYLOAD LENGKAP ---
  const payload = {
    owner_id: typeof owner_id !== "undefined" ? owner_id : 0,

    // IDs
    product_id: finalProductId, // Jika manual input, ini akan bernilai 0
    werehouse_id: finalWerehouseId,
    material_id: parseInt(getVal("formMaterial")) || 0, // Handle jika kosong
    unit_id: parseInt(getVal("formUnit")) || 0,
    category_id: parseInt(getVal("formCategoryId")) || 0,

    // Array ID Kategori Bisnis
    business_category_ids: selectedBusinessCategories,

    // TEXT DATA
    productcode: getVal("formSKU"),
    product: getVal("formProduct"), // Nama produk dari input text
    description: getVal("formDescription"),

    // NUMBER DATA
    sale_price: getInt("formPrice"),
    wholesale_price: getInt("formWholesalePrice"),
    maximum_stock: getInt("formMaxStock"),
    minimum_stock: getInt("formMinStock"),
    weight: getFloat("formBerat"),
  };

  console.log("Payload Final:", payload);
  return payload;
}

async function submitData(method, id = "") {
  const payload = getDataPayload(); // Ambil data dari form
  if (!payload) return; // Stop jika validasi gagal

  // Tentukan URL berdasarkan Method
  // POST -> add/product_werehouse
  // PUT  -> update/product_werehouse/{id}
  let endpoint = "";
  if (method === "POST") {
    endpoint = "add/product_werehouse";
  } else {
    endpoint = `update/product_werehouse/${id}`;
  }

  const url = `${baseUrl}/${endpoint}`;
  const actionText = method === "POST" ? "ditambahkan" : "diperbarui";

  console.log(`Mengirim ${method} ke: ${url}`);
  console.log("Body:", payload);

  try {
    const response = await fetch(url, {
      method: method, // ⬅️ Pastikan ini 'POST' atau 'PUT' sesuai parameter
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      // Cek HTTP Status 200-299
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Data produk berhasil ${actionText}`,
      });
      loadModuleContent("product"); // Kembali ke list
    } else {
      throw new Error(result.message || `Gagal ${actionText} data`);
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: error.message || `Terjadi kesalahan koneksi.`,
    });
  }
}

// --- HELPER FORMAT ANGKA ---
function setupPriceInputEvents() {
  // Tambahkan "formWholesalePrice" ke dalam list
  [
    "formPrice",
    "formWholesalePrice",
    "formBerat",
    "formMinStock",
    "formMaxStock",
  ].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => formatCurrencyInput(input));
    }
  });
}

function formatCurrencyInput(input) {
  const raw = input.value.replace(/[^\d]/g, "");
  if (!raw) {
    input.value = "";
    return;
  }
  input.value = parseInt(raw, 10).toLocaleString("id-ID");
}

// Reuse fungsi loadDropdown Anda sebelumnya
async function loadDropdown(selectId, apiUrl, valueField, labelField) {
  const select = document.getElementById(selectId);
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
    const result = await response.json();
    const listData = result.listData;

    select.innerHTML = `<option value="">Pilih...</option>`;
    if (Array.isArray(listData)) {
      listData.forEach((item) => {
        const option = document.createElement("option");
        option.value = item[valueField];
        option.textContent = item[labelField];
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error(`Gagal memuat ${selectId}:`, error);
  }
}
async function loadBusinessCategoryList(selectedIds = []) {
  const listContainer = document.getElementById("kategoriList");
  const searchInput = document.getElementById("searchKategori");

  try {
    listContainer.innerHTML = `<div class="col-span-2 text-center text-gray-500 text-sm py-2">Memuat kategori...</div>`;

    // 1. Fetch Data
    const response = await fetch(
      `${baseUrl}/list/business_category_active/${owner_id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      },
    );

    const result = await response.json();
    businessCategoryData = result.listData || []; // Simpan ke variabel global

    // 2. Render Awal (Tampilkan semua)
    renderCategoryList(businessCategoryData, selectedIds);

    // 3. Setup Event Listener untuk Pencarian
    // Hapus listener lama jika ada (optional, tapi good practice) untuk menghindari duplikasi
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    newSearchInput.addEventListener("input", function (e) {
      const keyword = e.target.value.toLowerCase();

      // Filter array berdasarkan keyword (cocokkan business_category atau description)
      const filtered = businessCategoryData.filter(
        (item) =>
          item.business_category.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword),
      );

      // Ambil ID yang sedang tercentang saat ini agar tidak hilang visualnya saat searching
      const currentChecked = getSelectedCategoryIds();

      // Render ulang hasil filter
      renderCategoryList(filtered, currentChecked);
    });
  } catch (error) {
    console.error("Gagal load kategori bisnis:", error);
    listContainer.innerHTML = `<div class="col-span-2 text-red-500 text-sm py-2">Gagal memuat data.</div>`;
  }
}
function renderCategoryList(data, selectedIds = []) {
  const listContainer = document.getElementById("kategoriList");
  listContainer.innerHTML = "";

  if (data.length === 0) {
    listContainer.innerHTML = `<div class="col-span-2 text-gray-400 text-sm py-2 italic">Tidak ditemukan.</div>`;
    return;
  }

  data.forEach((item) => {
    // Cek apakah item ini harus dicentang (untuk mode Edit atau persistensi saat search)
    // Pastikan konversi tipe data (string vs number) aman
    const isChecked = selectedIds.some(
      (id) => String(id) === String(item.business_category_id),
    );

    const div = document.createElement("div");
    div.className =
      "flex items-start space-x-2 p-2 hover:bg-white rounded border border-transparent hover:border-blue-200 transition";

    div.innerHTML = `
      <input type="checkbox" 
        id="cat_${item.business_category_id}" 
        name="business_category[]" 
        value="${item.business_category_id}"
        class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 business-cat-checkbox"
        ${isChecked ? "checked" : ""}
      >
      <label for="cat_${item.business_category_id}" class="text-sm cursor-pointer w-full select-none">
        <div class="font-bold text-gray-700">${item.description}</div>
        <div class="text-xs text-gray-500 font-mono">${item.business_category}</div>
      </label>
    `;

    listContainer.appendChild(div);
  });

  // Setup Listener untuk Update Counter setiap kali checkbox berubah
  document.querySelectorAll(".business-cat-checkbox").forEach((chk) => {
    chk.addEventListener("change", updateSelectedCount);
  });

  updateSelectedCount(); // Update angka awal
}

// --- FUNGSI UPDATE COUNTER ---
function updateSelectedCount() {
  const count = document.querySelectorAll(
    ".business-cat-checkbox:checked",
  ).length;
  document.getElementById("selectedCount").innerText =
    `${count} kategori dipilih`;
}

// --- FUNGSI AMBIL ID TERPILIH (Untuk Submit) ---
function getSelectedCategoryIds() {
  return Array.from(
    document.querySelectorAll(".business-cat-checkbox:checked"),
  ).map((cb) => parseInt(cb.value));
}
async function loadCategoryDropdown(selectedId = null) {
  const select = document.getElementById("formCategoryId");

  try {
    const response = await fetch(
      `${baseUrl}/list/product_category/${owner_id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      },
    );

    const result = await response.json();
    const listData = result.listData || [];

    select.innerHTML = '<option value="">Pilih Kategori...</option>';

    listData.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.category_id;
      option.textContent = item.category;

      // Auto select jika ada parameter selectedId
      if (selectedId && item.category_id == selectedId) {
        option.selected = true;
      }

      select.appendChild(option);
    });

    // Tambahkan Event Listener: Jika Kategori diubah manual -> Load Material baru
    select.addEventListener("change", function () {
      const catId = this.value;
      loadMaterialDropdown(catId); // Reload material sesuai kategori baru
    });
  } catch (error) {
    console.error("Gagal load kategori:", error);
    select.innerHTML = '<option value="">Gagal memuat data</option>';
  }
}
