pagemodule = 'Product';
colSpanCount = 9;
setDataType('product');
fetchAndUpdateData();

  window.rowTemplate = function (item, index, perPage = 10) {
    const { currentPage } = state[currentDataType];
    const globalIndex = (currentPage - 1) * perPage + index + 1;
  
    return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">
    <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
      <span class="font-medium sm:hidden">Kode</span>
      ${item.productcode}
    </td>
  
     <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Barang</span>  
    ${item.product}
    </td>

  
    <td class="px-6 py-4 text-sm text-right text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Harga</span>
      ${formatRupiah(item.sale_price)}
    </td>
  
     <td class="px-6 py-4 text-sm text-center text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Kategori</span>  
    ${item.category}
    </td>
  
     <td class="px-6 py-4 text-sm text-right text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Stok</span>  
    ${finance(item.weight)} gr
    </td>
  
     <td class="px-6 py-4 text-sm text-right text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Kemitraan</span>  
    ${item.business_categories.length > 0 
          ? item.business_categories.map(cat => cat.business_category).join(', ') 
          : '-'}
    </td>
  
  
    <td class="px-6 py-4 text-sm text-center text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
        ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
        ${item.status === 'Active' ? 'Active' : 'Inactive'}
      </span>
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
       <button onclick="event.stopPropagation(); loadModuleContent('product_form', '${item.product_id}', '${item.product.replace(/'/g, "\\'")}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        ✏️ Edit Product
      </button>
        ${item.status === 'Active' 
          ? `<button onclick="toggleProductStatus('${item.product_id}', '2')" class="block w-full text-left px-4 py-2 hover:bg-gray-100">🔴 Inactivate Product</button>` 
          : `<button onclick="toggleProductStatus('${item.product_id}', '1')" class="tblock w-full text-left px-4 py-2 hover:bg-gray-100">🟢 Activate Product</button>`}
        <button onclick="event.stopPropagation(); handleDelete(${item.product_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Delete Product
        </button>
      </div>
    </td>
  </tr>`;
  };
  
  

  document.getElementById('addButton').addEventListener('click', () => {
    // showFormModal();
    // loadDropdownCall();
    loadModuleContent('product_form');
  });

function toggleProductStatus(id, status_id) {
  const actionText = status_id === 1 ? 'mengaktifkan' : 'menonaktifkan';

  Swal.fire({
    title: `Yakin ingin ${actionText} produk ini?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${baseUrl}/update/product_status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({ status_id: status_id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.data && data.data.status_id) {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: data.data.message || 'Status berhasil diperbarui',
              timer: 2000,
              showConfirmButton: false
            });
            // Refresh list produk jika perlu:
            fetchAndUpdateData();// ganti dengan fungsi Anda jika berbeda
          } else {
            throw new Error('Gagal memperbarui status');
          }
        })
        .catch(err => {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: err.message || 'Terjadi kesalahan'
          });
        });
    }
  });
}



formHtml = `
<form id="dataform" class="space-y-2">
  <label for="fileInput" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">File</label>
  <input id="fileInput" type="file" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <div class="text-sm text-gray-500 dark:text-gray-300">
    Belum punya format? 
    <a href="assets/doc/contoh_import_produk.xlsx" download class="text-blue-600 hover:underline">Download template Excel</a>
  </div>
</form>
`;


function importData() {
  Swal.fire({
    title: 'Import Produk',
    html: formHtml,

    confirmButtonText: 'Import',
    showCancelButton: true,
    preConfirm: () => {
      const file = document.getElementById('fileInput').files[0];
      if (!file) {
        Swal.showValidationMessage('Silakan pilih file terlebih dahulu');
      } else {
        return file;
      }
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      handleFileRead(result.value);
    }
  });
}

function handleFileRead(file) {
  if (typeof XLSX === 'undefined') {
    return showErrorAlert('Library XLSX tidak ditemukan. Pastikan sudah di-include.');
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (!jsonData.length) {
        return showErrorAlert('File kosong atau format tidak valid.');
      }

      startImport(jsonData);
    } catch (err) {
      console.error(err);
      showErrorAlert('Gagal membaca file. Pastikan format file benar.');
    }
  };

  reader.readAsArrayBuffer(file);
}

function startImport(data) {
  let total = data.length;
  let current = 0;
  let successCount = 0;

  Swal.fire({
    title: 'Mengimpor Produk...',
    html: `<div id="importStatus" style="text-align:left; max-height:300px; overflow-y:auto; font-size:14px;"></div>`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      const statusContainer = document.getElementById('importStatus');

      function importNext() {
        if (current >= total) {
          console.log('current : ', current)
          console.log('total : ', total)
          statusContainer.innerHTML += `<hr class="my-2" />
    <p>✅ Total data: <strong>${total}</strong></p>
    <p>✅ Berhasil diimpor: <strong>${successCount}</strong></p>
    <div class="mt-4 text-right">
      <button id="doneBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded">Selesai</button>
    </div>`;

  // Tombol selesai handler
  setTimeout(() => {
    const doneBtn = document.getElementById('doneBtn');
    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        Swal.close();
        fetchAndUpdateData();
      });
    }
  }, 100);
  
  return;
        }

        const row = data[current];
        let businessCategories = [];

        try {
          businessCategories = JSON.parse(row.business_category_ids || '[]');
        } catch (e) {
          console.warn(`Baris ${current + 1}: Format business_category_ids tidak valid, default []`);
        }

        const formData = {
          owner_id: owner_id,
          category_id: parseInt(row.category_id || 1),
          unit_id: parseInt(row.unit_id || 6),
          status_id: parseInt(row.status_id || 1),
          productcode: row.productcode,
          product: row.product,
          cogs: parseInt(row.cogs || 0),
          sale_price: parseInt(row.sale_price || 0),
          wholesale_price: parseInt(row.wholesale_price || 0),
          limitstock: parseInt(row.limitstock || 0),
          description: row.description || '',
          weight: parseFloat(row.weight || 0),
          business_category_ids: businessCategories
        };

        const itemNo = current + 1;
        statusContainer.innerHTML += `<p>⏳ Mengimpor data #${itemNo} - ${formData.product}...</p>`;
        statusContainer.scrollTop = statusContainer.scrollHeight;

        handleImport(formData, null, (success = true) => {
          if (success) successCount++;

          statusContainer.innerHTML += `<p>✅ Selesai data #${itemNo} - ${formData.product}</p>`;
          statusContainer.scrollTop = statusContainer.scrollHeight;
          current++;
          setTimeout(importNext, 300);
        });
      }

      importNext();
    }
  });
}


function handleImport(formData, detail_id, callback) {
  // Swal.showLoading();

  const createUrl = `${baseUrl}/add/product`;
  if (!createUrl) {
    showErrorAlert('Endpoint tidak ditemukan.');
    return;
  }

  fetch(createUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
.then(data => {
  const isSuccess = !!data?.data?.id;
  handleImportResponse(data, detail_id);
  if (typeof callback === 'function') callback(isSuccess);
})
.catch(err => {
  console.error(err);
  showErrorAlert('Gagal mengirim data. Silakan coba lagi.');
  if (typeof callback === 'function') callback(false);
});
}

function handleImportResponse(data, detail_id) {
  if (data?.data?.id) {
    console.log('Produk berhasil dibuat:', data.data.id);
  } else {
    console.warn('Gagal membuat produk:', data);
  }
}

function showErrorAlert(message) {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message
  });
}



