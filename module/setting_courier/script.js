pagemodule = 'Setting Kurir'
colSpanCount = 9;
setDataType('courier');
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
  console.log("Data yang diterima:", data);

  // Helper untuk menunggu sampai <option> tersedia (penting jika option di-load via API lain)
  async function waitForOption(selectId, expectedValue, timeout = 3000) {
    return new Promise((resolve) => {
      const interval = 100;
      let waited = 0;

      const check = () => {
        const select = document.getElementById(selectId);
        if (!select) return resolve(); // Guard jika element tidak ada
        
        const exists = Array.from(select.options).some(opt => opt.value === expectedValue?.toString());
        if (exists || waited >= timeout) {
          resolve();
        } else {
          waited += interval;
          setTimeout(check, interval);
        }
      };
      check();
    });
  }

  // 1. Sesuaikan pengisian Owner ID (sebelumnya account_id)
  const ownerIdValue = data.owner_id || ''; 
  await waitForOption('formBank', ownerIdValue);
  const formBank = document.getElementById('formBank');
  if (formBank) formBank.value = ownerIdValue;

  // 2. Sesuaikan pengisian Courier (sebelumnya tag)
  const courierInput = document.getElementById('formCourier');
  if (courierInput) {
    courierInput.value = data.courier || '';
  }

  // Catatan: Input type="file" tidak bisa diisi secara otomatis lewat JavaScript 
  // karena alasan keamanan browser (security restriction). 
  // User harus memilih file secara manual.
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
  loadDropdown('formBank', `${baseUrl}/list/finance_account`, 'account_id', 'account');
  // loadDropdown('formPM', `${baseUrl}/list/project_manager/${owner_id}`, 'project_manager_id', 'name');
} 


  window.rowTemplate = function (item, index, perPage = 10) {
  const { currentPage } = state[currentDataType];
  const globalIndex = (currentPage - 1) * perPage + index + 1;
  
  // Base URL untuk logo
  const logoBaseUrl = "https://devngomset.katib.cloud/logo/courier/";
  // Kita asumsikan filenya menggunakan nama kurir atau field tertentu dari API
  const logoUrl = `${logoBaseUrl}${item.courier_logo}`; 

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
        <button onclick="event.stopPropagation(); handleEdit(${item.courier_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100">✏️ Edit</button>
        <button onclick="event.stopPropagation(); handleDelete(${item.courier_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Delete
        </button>
      </div>
    </td>
     <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Logo</span>
      <div class="w-12 h-12 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
        <img src="${logoUrl}" alt="${item.courier}" onerror="this.src='https://via.placeholder.com/50?text=No+Img'" class="max-w-full max-h-full object-contain">
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

  <label for="formCourier" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Kurir</label>
  <input id="formCourier" name="courier" type="text" placeholder="J&T Cargo" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <label for="formFile" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Upload File</label>
  <input id="formFile" name="file" type="file" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">





</form>

  `
requiredFields = [
    { field: 'formProject', message: 'Project Name is required!' },
    { field: 'formPM', message: 'Project Manager is required!' },
    { field: 'formStartDate', message: 'Starting Date is required!' },
    { field: 'formDeadline', message: 'Deadline is required!' }
  ];  



