pagemodule = 'Product';
colSpanCount = 9;
setDataType('product_bundling');
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
        ${item.business_category}
    </td>
  
  
    <td class="px-6 py-4 text-sm text-center text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
        ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
        ${item.status === 'Active' ? 'Active' : 'Inactive'}
      </span>
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
        <button onclick="event.stopPropagation(); loadModuleContent('bundling_form', '${item.product_id}', '${item.product.replace(/'/g, "\\'")}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
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
    loadModuleContent('bundling_form');
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
