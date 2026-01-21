currentClientId = window.detail_id;
currentClientName = window.detail_desc;

detail_id = currentClientId;

// 2. KONFIGURASI MODUL
// -----------------------------------------------------------------
pagemodule = "Pelanggan";
subpagemodule = "Pelanggan Detail";
renderHeader();
colSpanCount = 3;
setDataType("contact");

// 3. UPDATE UI SPESIFIK MODUL
// -----------------------------------------------------------------
document.getElementById("clientNameTitle").textContent =
  currentClientName || "Client Detail";

// 4. DEFINISI FORM MODAL
// -----------------------------------------------------------------
/* Update: Menambahkan field alamat, region_id (hidden), 
   input pencarian wilayah, dan field detail wilayah (readonly)
*/
formHtml = `
<form id="dataform" class="space-y-4">
  <input type="hidden" name="owner_id" value="${owner_id}">
  <input type="hidden" name="pelanggan_id" value="${currentClientId}">
  <input type="hidden" name="region_id" id="formRegionId">

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="formNama" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nama Kontak</label>
        <input id="formNama" name="name" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required>
      </div>
      <div>
        <label for="formPhone" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone</label>
        <input id="formPhone" name="phone" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required>
      </div>
  </div>

  <div>
      <label for="formEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
      <input id="formEmail" name="email" type="email" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required>
  </div>

  <hr class="border-gray-200 dark:border-gray-700 my-2">

  <div>
      <label for="formAddress" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Alamat Lengkap (Jalan/Gang/No)</label>
      <input id="formAddress" name="address" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Gang Mesjid 1">
  </div>

  <div class="relative bg-blue-50 p-3 rounded-md border border-blue-100 dark:bg-gray-800 dark:border-gray-600">
      <label for="searchRegionInput" class="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
        🔍 Cari Wilayah (Auto-fill)
      </label>
      <input id="searchRegionInput" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Ketik kelurahan untuk mengisi form di bawah secara otomatis..." autocomplete="off">
      
      <ul id="regionResultsList" class="absolute z-50 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto hidden mt-1 dark:bg-gray-800 dark:border-gray-700"></ul>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
         <label for="formKelurahan" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Kelurahan</label>
         <input id="formKelurahan" name="kelurahan" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>
      <div>
         <label for="formKecamatan" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Kecamatan</label>
         <input id="formKecamatan" name="kecamatan" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>
      <div>
         <label for="formKota" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Kota/Kabupaten</label>
         <input id="formKota" name="kota" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>
      
      <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <label for="formProvinsi" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Provinsi</label>
            <input id="formProvinsi" name="provinsi" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label for="formPOS" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Kode Pos</label>
            <input id="formPOS" name="kode_pos" type="text" class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
          </div>
      </div>
  </div>
</form>
`;

// 5. ATURAN VALIDASI FORM
// -----------------------------------------------------------------
requiredFields = [
  { field: "name", message: "Nama Kontak wajib diisi!" },
  { field: "email", message: "Email wajib diisi!" },
  { field: "phone", message: "Nomor Telepon wajib diisi!" },
  { field: "address", message: "Alamat wajib diisi!" },
  {
    field: "region_id",
    message: "Silakan cari dan pilih wilayah (Kelurahan)!",
  },
];

async function fillFormData(data) {
  // 1. Normalisasi Data: Cek apakah data ada di dalam properti 'detail' atau langsung
  const source = data.detail || data;

  console.log("🔄 Mengisi Form dengan Data:", source);

  // 2. Isi Hidden Fields & Field Utama
  // Gunakan global 'owner_id' jika di data source tidak ada
  document.querySelector("input[name='owner_id']").value =
    source.owner_id || (typeof owner_id !== "undefined" ? owner_id : "");
  document.querySelector("input[name='pelanggan_id']").value =
    source.pelanggan_id || "";
  document.getElementById("formRegionId").value = source.region_id || "";

  document.getElementById("formNama").value = source.name || "";
  document.getElementById("formEmail").value = source.email || "";
  document.getElementById("formPhone").value = source.phone || "";
  document.getElementById("formAddress").value = source.address || "";

  // 3. Logika Parsing 'region_name'
  // Format Source: "Sukadamai, Dramaga, Kabupaten Bogor, Jawa Barat 16680"
  const regionString = source.region_name || "";

  if (regionString) {
    // Tampilkan teks lengkap di search bar agar user tahu
    document.getElementById("searchRegionInput").value = regionString;

    // Pecah string berdasarkan tanda koma (,)
    // Hasil: ["Sukadamai", "Dramaga", "Kabupaten Bogor", "Jawa Barat 16680"]
    const parts = regionString.split(",").map((s) => s.trim());

    // Mapping array ke kolom input (jaga-jaga jika format tidak lengkap)
    document.getElementById("formKelurahan").value = parts[0] || ""; // Index 0: Kelurahan
    document.getElementById("formKecamatan").value = parts[1] || ""; // Index 1: Kecamatan
    document.getElementById("formKota").value = parts[2] || ""; // Index 2: Kota

    // Handle Bagian Terakhir (Provinsi + Kode Pos) -> "Jawa Barat 16680"
    if (parts[3]) {
      const lastPart = parts[3];

      // Cari angka 5 digit di akhir string (Asumsi Kode Pos)
      const zipMatch = lastPart.match(/\d{5}$/);

      if (zipMatch) {
        document.getElementById("formPOS").value = zipMatch[0]; // Ambil Kode Pos
        // Ambil nama provinsi (hapus kode pos dari string)
        document.getElementById("formProvinsi").value = lastPart
          .replace(zipMatch[0], "")
          .trim();
      } else {
        // Jika tidak ada kode pos, anggap semuanya provinsi
        document.getElementById("formProvinsi").value = lastPart;
        document.getElementById("formPOS").value = "";
      }
    }
  } else {
    // Kosongkan jika region_name tidak ada
    document.getElementById("searchRegionInput").value = "";
    document.getElementById("formKelurahan").value = "";
    document.getElementById("formKecamatan").value = "";
    document.getElementById("formKota").value = "";
    document.getElementById("formProvinsi").value = "";
    document.getElementById("formPOS").value = "";
  }
}

/**
 * Memuat logika pencarian wilayah saat modal dibuka.
 * Dipanggil secara global oleh showFormModal()
 */
function loadDropdownCall() {
  const input = document.getElementById("searchRegionInput");
  const resultList = document.getElementById("regionResultsList");

  // Fungsi Search City (Logic dari User)
  async function searchCity(query) {
    if (!query.trim()) {
      resultList.innerHTML = "";
      resultList.classList.add("hidden");
      return;
    }

    try {
      // Menggunakan owner_id global
      const url = `https://region.katib.cloud/table/region/${owner_id}/1?search=${encodeURIComponent(query)}`;
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
            <li class="px-3 py-2 border-b hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-left"
                data-kelurahan="${item.kelurahan}"
                data-kecamatan="${item.kecamatan}"
                data-kota="${item.kota}"
                data-provinsi="${item.provinsi}"
                data-kodepos="${item.kode_pos}"
                data-region_id="${item.region_id}">
                <div class="font-bold text-gray-800 dark:text-gray-200">${item.kelurahan}</div>
                <div class="text-xs text-gray-500">${item.kecamatan}, ${item.kota}, ${item.provinsi} (${item.kode_pos})</div>
            </li>`,
            )
            .join("")
        : '<li class="px-3 py-2 text-gray-500 text-sm">Tidak ditemukan</li>';

      resultList.classList.remove("hidden");

      // Tambahkan event listener untuk setiap hasil pencarian
      resultList.querySelectorAll("li[data-kelurahan]").forEach((li) => {
        li.addEventListener("click", () => {
          // Isi ke Hidden Input & Readonly Fields
          document.getElementById("formRegionId").value = li.dataset.region_id;

          document.getElementById("formKelurahan").value = li.dataset.kelurahan;
          document.getElementById("formKecamatan").value = li.dataset.kecamatan;
          document.getElementById("formKota").value = li.dataset.kota;
          document.getElementById("formProvinsi").value = li.dataset.provinsi;
          document.getElementById("formPOS").value = li.dataset.kodepos;

          // Update text di search bar agar user lihat
          input.value = `${li.dataset.kelurahan}, ${li.dataset.kecamatan}, ${li.dataset.kota}`;

          // Sembunyikan list
          resultList.classList.add("hidden");
          resultList.innerHTML = "";
        });
      });
    } catch (err) {
      console.error("Gagal ambil data wilayah:", err);
      resultList.innerHTML =
        '<li class="px-2 py-1 text-red-500 text-sm">Gagal ambil data</li>';
      resultList.classList.remove("hidden");
    }
  }

  // Event Listener: Ketik (Debounce sederhana bisa ditambahkan jika perlu)
  if (input) {
    input.addEventListener("input", (e) => {
      searchCity(e.target.value);
    });

    // Menyembunyikan dropdown jika klik di luar
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !resultList.contains(e.target)) {
        resultList.classList.add("hidden");
      }
    });
  }
}

/**
 * Template Baris Tabel
 */
window.rowTemplate = function (item, index, perPage = 10) {
  return `
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0">${item.name || "-"}</td>
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0">${item.email || "-"}</td>
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0">
      ${item.phone || "-"}
      <br><span class="text-xs text-gray-500">${item.kota || ""}</span>
      
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
       <button onclick="event.stopPropagation(); handleEdit('${item.contact_id}', '${item.name}', this)"
          class="block w-full text-left px-4 py-2 hover:bg-gray-100" data-id="${item.contact_id}">
          ✏️ Edit Kontak
        </button>
        <button onclick="event.stopPropagation(); handleDelete(${item.contact_id})" 
          class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Delete Kontak
        </button>
      </div>
    </td>
  `;
};

// 7. EVENT LISTENERS
// -----------------------------------------------------------------
document.getElementById("addButton").addEventListener("click", () => {
  showFormModal();
  loadDropdownCall();
});

searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("keyup", debounceSearch);
}

// -----------------------------------------------------------------
// 9. FUNGSI VALIDASI (Wajib ada karena dipanggil table.js)
// -----------------------------------------------------------------
window.validateFormData = function (data) {
  // Menggunakan variable global 'requiredFields' yang sudah didefinisikan sebelumnya
  for (const rule of requiredFields) {
    // Cek apakah field ada di data dan isinya tidak kosong
    if (!data[rule.field] || data[rule.field].toString().trim() === "") {
      // Jika menggunakan SweetAlert2 (bawaan template biasanya ada)
      if (typeof Swal !== "undefined") {
        Swal.showValidationMessage(rule.message);
      } else {
        alert(rule.message);
      }

      return false; // Validasi Gagal
    }
  }
  return true; // Validasi Berhasil
};

// 8. PANGGILAN DATA PERTAMA
fetchAndUpdateData(detail_id);
