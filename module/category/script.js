pagemodule = 'Business category'
colSpanCount = 9;
setDataType('business_category');
fetchAndUpdateData();

function validateFormData(formData, requiredFields = []) {
  console.log('Validasi Form');
  for (const { field, message } of requiredFields) {
    if (!formData[field] || formData[field].trim() === '') {
      alert(message);
      return false;
    }
  }
  return true;
} 

async function fillFormData(data) {
  console.log(data);
  document.getElementById('formCat').value = data.business_category || '';
  document.getElementById('formDesc').value = data.description || '';
  document.getElementById('formStatus').value = data.status_id || '';
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

function loadDropdownCall() {
  // loadDropdown('formProject', `${baseUrl}/list/project_won/${owner_id}`, 'pesanan_id', 'project_name');
  // loadDropdown('formPM', `${baseUrl}/list/project_manager/${owner_id}`, 'project_manager_id', 'name');
} 


  window.rowTemplate = function (item, index, perPage = 10) {
    const { currentPage } = state[currentDataType];
    const globalIndex = (currentPage - 1) * perPage + index + 1;
  
    return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">  
     <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Name</span>  
    ${item.business_category}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Email</span>
      ${item.description}
    </td>
  
  
    <td class="px-6 py-4 text-sm text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
        ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
        ${item.status === 'Active' ? 'Active' : 'Inactive'}
      </span>
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
        <button onclick="event.stopPropagation(); handleEdit(${item.business_category_id}, '${item.business_category}')" class="block w-full text-left px-4 py-2 hover:bg-gray-100">✏️ Edit Category</button>
        ${item.status === 'Active' 
          ? `<button onclick="toggleProductStatus('${item.business_category_id}', '2')" class="block w-full text-left px-4 py-2 hover:bg-gray-100">🔴 Inactivate Product</button>` 
          : `<button onclick="toggleProductStatus('${item.business_category_id}', '1')" class="tblock w-full text-left px-4 py-2 hover:bg-gray-100">🟢 Activate Product</button>`}
        <button onclick="event.stopPropagation(); handleDelete(${item.business_category_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">🗑 Delete Category</button>
      </div>
    </td>
  </tr>`;
  };
  
  document.getElementById('addButton').addEventListener('click', () => {
    showFormModal();
    loadDropdownCall();
  });

  formHtml = `
<form id="dataform" class="space-y-2">

  <label for="formCat" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Kode</label>
  <input id="formCat" name="business_category" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <label for="formDesc" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Deskripsi</label>
  <input id="formDesc" name="description" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <label for="formStatus" class="hidden block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Status</label>
  <input id="formStatus" name="status_id" type="text" value="1" class="hidden form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

</form>

  `
requiredFields = [
    { field: 'formProject', message: 'Project Name is required!' },
    { field: 'formPM', message: 'Project Manager is required!' },
    { field: 'formStartDate', message: 'Starting Date is required!' },
    { field: 'formDeadline', message: 'Deadline is required!' }
  ];  

function toggleProductStatus(id, status_id) {
  const actionText = status_id === 1 ? 'mengaktifkan' : 'menonaktifkan';

  Swal.fire({
    title: `Yakin ingin ${actionText} category ini?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${baseUrl}/update/business_category_status/${id}`, {
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

