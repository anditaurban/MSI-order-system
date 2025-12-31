pagemodule = "product_return";
colSpanCount = 8;
setDataType("product_return"); // Sesuaikan dengan key di state manager Anda
fetchAndUpdateData();

// --- ROW TEMPLATE ---
window.rowTemplate = function (item, index, perPage = 10) {
  const { currentPage } = state[currentDataType];
  // const globalIndex = (currentPage - 1) * perPage + index + 1;

  // Logika Badge Kondisi
  let conditionBadge = "";
  if (item.condition === "good") {
    conditionBadge = `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Baik</span>`;
  } else if (item.condition === "bad") {
    conditionBadge = `<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Rusak</span>`;
  } else {
    conditionBadge = `<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Expired</span>`;
  }

  return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">
    <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
      <span class="font-medium sm:hidden">Tanggal</span>
      ${item.return_date}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
       <span class="font-medium sm:hidden">No. Ref</span>  
       ${item.ref_number || "-"}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Customer</span>
      ${item.customer_name || "Umum"}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
       <span class="font-medium sm:hidden">Produk</span>  
       <div class="font-semibold">${item.product || item.product_name}</div>
       <div class="text-xs text-gray-500">${item.productcode || ""}</div>
    </td>

    <td class="px-6 py-4 text-sm text-center text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
       <span class="font-medium sm:hidden">Qty</span>  
       <span class="font-bold text-purple-600">${finance(item.qty)}</span>
    </td>
  
    <td class="px-6 py-4 text-sm text-center text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
       <span class="font-medium sm:hidden">Kondisi</span>  
       ${conditionBadge}
    </td>
  
    <td class="px-6 py-4 text-sm text-right text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
       <span class="font-medium sm:hidden">Catatan</span>  
       ${item.note || item.notes || "-"}
    </td>

    <td class="px-6 py-4 text-sm text-center text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell relative">
       <span class="font-medium sm:hidden">Aksi</span>
       
       <div class="group relative inline-block text-left">
         <button class="text-gray-500 hover:text-purple-600 font-bold text-lg">⋮</button>
         <div class="dropdown-menu hidden group-hover:block absolute right-0 mt-0 w-40 bg-white border rounded shadow-lg z-50 text-sm">
            <button onclick="event.stopPropagation(); loadModuleContent('retur_form', '${
              item.return_id
            }');" 
                class="block w-full text-left px-4 py-2 hover:bg-purple-50 text-blue-600">
                ✏️ Edit Retur
            </button>
            <button onclick="event.stopPropagation(); deleteRetur(${
              item.return_id
            })" 
                class="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600">
                🗑 Hapus
            </button>
         </div>
       </div>
    </td>
  </tr>`;
};

// Event Listener Tambah
document.getElementById("addButton").addEventListener("click", () => {
  loadModuleContent("retur_form");
});

// --- FUNGSI DELETE (Diadaptasi ke SweetAlert style Anda) ---
function deleteRetur(id) {
  Swal.fire({
    title: `Yakin ingin menghapus data retur ini?`,
    text: "Stok akan disesuaikan kembali.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#d33",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${baseUrl}/delete/product_return/${id}`, {
        method: "DELETE", // Sesuaikan method API Anda (DELETE/POST)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Gagal menghapus");
        })
        .then((data) => {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data retur dihapus",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchAndUpdateData();
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: err.message || "Terjadi kesalahan",
          });
        });
    }
  });
}

// --- LOGIKA IMPORT EXCEL (Diadaptasi untuk Retur) ---
formHtml = `
<form id="dataform" class="space-y-2">
  <label for="fileInput" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">File Excel</label>
  <input id="fileInput" type="file" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">

  <div class="text-sm text-gray-500 dark:text-gray-300">
    Format: Tanggal (YYYY-MM-DD), No.Ref, Kode Barang, Qty, Kondisi (good/bad), Catatan.
    <br>
    <a href="assets/doc/contoh_import_retur.xlsx" download class="text-purple-600 hover:underline">Download template</a>
  </div>
</form>
`;

function importData() {
  Swal.fire({
    title: "Import Data Retur",
    html: formHtml,
    confirmButtonText: "Import",
    confirmButtonColor: "#9333ea", // Purple
    showCancelButton: true,
    preConfirm: () => {
      const file = document.getElementById("fileInput").files[0];
      if (!file) {
        Swal.showValidationMessage("Silakan pilih file terlebih dahulu");
      } else {
        return file;
      }
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      handleFileRead(result.value);
    }
  });
}

function handleFileRead(file) {
  if (typeof XLSX === "undefined") {
    return showErrorAlert("Library XLSX tidak ditemukan.");
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (!jsonData.length) {
        return showErrorAlert("File kosong atau format tidak valid.");
      }
      startImport(jsonData);
    } catch (err) {
      console.error(err);
      showErrorAlert("Gagal membaca file excel.");
    }
  };
  reader.readAsArrayBuffer(file);
}

function startImport(data) {
  let total = data.length;
  let current = 0;
  let successCount = 0;

  Swal.fire({
    title: "Mengimpor Retur...",
    html: `<div id="importStatus" style="text-align:left; max-height:300px; overflow-y:auto; font-size:14px;"></div>`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      const statusContainer = document.getElementById("importStatus");

      function importNext() {
        if (current >= total) {
          statusContainer.innerHTML += `<hr class="my-2" />
            <p>✅ Total baris: <strong>${total}</strong></p>
            <p>✅ Berhasil: <strong>${successCount}</strong></p>
            <div class="mt-4 text-right">
              <button id="doneBtn" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded">Selesai</button>
            </div>`;

          setTimeout(() => {
            const doneBtn = document.getElementById("doneBtn");
            if (doneBtn) {
              doneBtn.addEventListener("click", () => {
                Swal.close();
                fetchAndUpdateData();
              });
            }
          }, 100);
          return;
        }

        const row = data[current];

        // Mapping Data Excel ke Payload API Retur
        // Asumsi Excel punya kolom: date, ref, customer, product_id_db, qty, condition, note
        const formData = {
          owner_id: owner_id,
          werehouse_id: parseInt(user.werehouse_id), // Pakai Session User

          // Note: Di Excel idealnya ada product_werehouse_id atau sistem mencari based on SKU
          product_werehouse_id: parseInt(row.product_werehouse_id || 0),

          return_date:
            row.return_date || new Date().toISOString().split("T")[0],
          ref_number: row.ref_number || "-",
          customer_name: row.customer_name || "Umum",
          qty: parseInt(row.qty || 0),
          condition: row.condition || "good", // good, bad, expired
          note: row.note || "",
        };

        const itemNo = current + 1;
        statusContainer.innerHTML += `<p>⏳ Proses baris #${itemNo}...</p>`;
        statusContainer.scrollTop = statusContainer.scrollHeight;

        handleImport(formData, null, (success = true) => {
          if (success) {
            successCount++;
            statusContainer.innerHTML += `<p class="text-green-600">✅ Sukses baris #${itemNo}</p>`;
          } else {
            statusContainer.innerHTML += `<p class="text-red-600">❌ Gagal baris #${itemNo}</p>`;
          }

          statusContainer.scrollTop = statusContainer.scrollHeight;
          current++;
          setTimeout(importNext, 300); // Delay biar animasi kelihatan
        });
      }

      importNext();
    },
  });
}

function handleImport(formData, detail_id, callback) {
  const createUrl = `${baseUrl}/add/product_return`;

  fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Cek response API Anda, misal sukses jika ada data ID
      const isSuccess = response.ok || (data.data && data.data.id);
      if (typeof callback === "function") callback(isSuccess);
    })
    .catch((err) => {
      console.error(err);
      if (typeof callback === "function") callback(false);
    });
}

function showErrorAlert(message) {
  Swal.fire({ icon: "error", title: "Oops...", text: message });
}
