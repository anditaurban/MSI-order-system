pagemodule = 'Setting Kurir'
colSpanCount = 9;
setDataType('courier');
fetchAndUpdateData();

function validateFormData(formData, fields = requiredFields) {
  console.log('Validasi Form');
  
  // Jika formData adalah instance dari FormData (untuk upload file)
  const isFormData = formData instanceof FormData;

  for (const { field, message } of fields) {
    // Ambil value berdasarkan tipe data yang masuk
    const value = isFormData ? formData.get(field) : formData[field];

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      Swal.fire('Error', message, 'error');
      return false;
    }
  }
  return true;
}

async function fillFormData(data) {
  // Pastikan mengambil objek di dalam 'detail' sesuai log konsol kamu
  const detail = data.detail || data; 
  if (!detail) {
    console.error("Gagal membedah data detail");
    return;
  }

  // Isi ID Utama agar table.js tahu ID mana yang di-update
  if (document.getElementById('formId')) {
    document.getElementById('formId').value = detail.courier_id || '';
  }

  // Isi Nama Kurir
  if (document.getElementById('formCourier')) {
    document.getElementById('formCourier').value = detail.courier || '';
  }
  
  // Isi Owner ID
  if (document.getElementById('owner_id')) {
    document.getElementById('owner_id').value = detail.owner_id || window.owner_id || '';
  }

  // PENTING: Isi file_text agar saat Edit tanpa ganti gambar, logo tidak hilang
  if (document.getElementById('file_text')) {
    document.getElementById('file_text').value = detail.courier_logo || '';
  }

  // Update Preview Logo
  const preview = document.getElementById('logoPreview');
  if (preview && detail.courier_logo) {
    preview.src = detail.courier_logo;
    preview.classList.remove('hidden');
  }
}


// 3. Perbarui Required Fields agar sesuai dengan ID di formHtml



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

// function loadDropdownCall() {
//   loadDropdown('formBank', `${baseUrl}/list/finance_account`, 'account_id', 'account');
//   // loadDropdown('formPM', `${baseUrl}/list/project_manager/${owner_id}`, 'project_manager_id', 'name');
// } 


  window.rowTemplate = function (item, index, perPage = 10) {
  const { currentPage } = state[currentDataType];
  const globalIndex = (currentPage - 1) * perPage + index + 1;
  
  const logoUrl = item.courier_logo || 'https://via.placeholder.com/50?text=No+Img'; 

  return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">  
    
   

    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">ID</span>  
      ${item.courier_id}
    </td>
    

    <td class="px-6 py-4 text-sm text-gray-700 flex justify-between sm:table-cell relative">
      <span class="font-medium sm:hidden">Courier</span>
      ${item.courier}
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
<button onclick="event.stopPropagation(); handleEdit(${item.courier_id}, '${item.courier}')" 
        class="block w-full text-left px-4 py-2 hover:bg-gray-100">
    ✏️ Edit
</button>
        <button onclick="event.stopPropagation(); handleDelete(${item.courier_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Delete
        </button>
      </div>
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Logo</span>
      <div class="w-12 h-12 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
        <img src="${logoUrl}" alt="${item.courier}" 
             onerror="this.src='https://via.placeholder.com/50?text=No+Img'" 
             class="max-w-full max-h-full object-contain">
      </div>
    </td>
  </tr>`;
};
  
  document.getElementById('addButton').addEventListener('click', () => {
    showFormModal();
    loadDropdownCall();
  });

formHtml = `
<form id="dataform" class="space-y-2" onsubmit="event.preventDefault();">
  <input type="hidden" id="formId" name="courier_id">
  <input type="hidden" id="owner_id" name="owner_id" value="${owner_id}">
  <input type="hidden" id="file_text" name="file_text">

  <label for="formCourier" class="block text-sm font-medium text-left">Kurir</label>
  <input id="formCourier" name="courier" type="text" placeholder="J&T Cargo" 
         class="form-control w-full px-3 py-2 border rounded-md">

  <label for="file" class="block text-sm font-medium text-left">Upload File (Logo)</label>
  <input id="file" name="file" type="file" class="form-control w-full px-3 py-2 border rounded-md">
  
  <div class="mt-2 text-left">
    <img id="logoPreview" src="" class="h-16 w-16 object-contain border rounded p-1 hidden" 
         onerror="this.classList.add('hidden')">
  </div>
</form>
`;
requiredFields = [
    { field: 'courier', message: 'Nama Kurir wajib diisi!' },
];



