currentClientId = window.detail_id;
currentClientName = window.detail_desc;

detail_id = currentClientId;

// 2. KONFIGURASI MODUL (Variabel Global untuk table.js)
// -----------------------------------------------------------------
pagemodule = "Pelanggan";
subpagemodule = "Pelanggan Detail";
renderHeader(); // Untuk judul modal
colSpanCount = 3; // Sesuaikan dengan jumlah kolom <thead>
setDataType("contact"); // Mengatur state global: state['contact']
// 3. UPDATE UI SPESIFIK MODUL
// -----------------------------------------------------------------
document.getElementById("clientNameTitle").textContent =
  currentClientName || "Client Detail";

// 4. DEFINISI FORM MODAL (Global `formHtml`)
// -----------------------------------------------------------------
// Ini akan digunakan oleh showFormModal() & handleEdit() dari table.js
formHtml = `
<form id="dataform" class="space-y-2">
  <input type="hidden" name="owner_id" value="${owner_id}">
  <input type="hidden" name="pelanggan_id" value="${currentClientId}">

  <label for="formNama" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Nama Kontak</label>
  <input id="formNama" name="name" type="text" class="form-control w-full px-3 py-2 border rounded-md" required>

  <label for="formEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Email</label>
  <input id="formEmail" name="email" type="email" class="form-control w-full px-3 py-2 border rounded-md" required>

  <label for="formPhone" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Phone</label>
  <input id="formPhone" name="phone" type="text" class="form-control w-full px-3 py-2 border rounded-md" required>
</form>
`;

// 5. ATURAN VALIDASI FORM (Global `requiredFields`)
// -----------------------------------------------------------------
// Ini akan digunakan oleh validateFormData() (diasumsikan ada di global)
requiredFields = [
  { field: "name", message: "Nama Kontak wajib diisi!" },
  { field: "email", message: "Email wajib diisi!" },
  { field: "phone", message: "Nomor Telepon wajib diisi!" },
];

async function fillFormData(data) {
  console.log("🔄 Isi form kontak dengan data:", data);
  document.querySelector("input[name='owner_id']").value =
    data.owner_id || owner_id;
  document.querySelector("input[name='pelanggan_id']").value =
    data.pelanggan_id || currentClientId;
  document.getElementById("formNama").value = data.name || "";
  document.getElementById("formEmail").value = data.email || "";
  document.getElementById("formPhone").value = data.phone || "";
}

/**
 * Memuat dropdown saat modal dibuka.
 * Dipanggil secara global oleh showFormModal() & handleEdit() dari table.js
 */
function loadDropdownCall() {
  // Tidak ada dropdown yang perlu dimuat untuk form kontak ini
  console.log("Tidak ada dropdown untuk dimuat.");
}

/**
 * Mendefinisikan template baris tabel.
 * Dipanggil secara global oleh loadData() dari table.js
 */
window.rowTemplate = function (item, index, perPage = 10) {
  // 'item' adalah objek KONTAK: { contact_id, name, email, phone }
  return `
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0">${
      item.name || "-"
    }</td>
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0">${
      item.email || "-"
    }</td>
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0">${
      item.phone || "-"
    }
    <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
        <button onclick="event.stopPropagation(); handleEdit('${
          item.contact_id
        }', '${item.name}')" 
          class="block w-full text-left px-4 py-2 hover:bg-gray-100" data-id="${
            item.contact_id
          }">✏️ Edit Kontak</button>
        <button onclick="event.stopPropagation(); handleDelete(${
          item.contact_id
        })" 
          class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Delete Kontak
        </button>
      </div>
    </td>

  `;
};

// 7. EVENT LISTENERS
// -----------------------------------------------------------------

// Pasang listener ke tombol "Tambah Kontak" (ID: addButton)
// Ini akan memanggil showFormModal() global dari table.js
document.getElementById("addButton").addEventListener("click", () => {
  showFormModal();
  loadDropdownCall(); // Panggil fungsi dropdown kustom kita
});

// Pasang listener ke search bar (ID: searchInput)
// Ini akan memanggil debounceSearch() global dari table.js
searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("keyup", debounceSearch);
}

// 8. PANGGILAN DATA PERTAMA
// -----------------------------------------------------------------
// Memanggil fungsi fetchAndUpdateData() GLOBAL dari table.js
// Kita teruskan 'detail_id' (yang sudah kita isi dengan currentClientId)
fetchAndUpdateData(detail_id);
