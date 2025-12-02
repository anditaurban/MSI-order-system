pagemodule = 'Receipt'
colSpanCount = 9;
setDataType('sales_receipt');
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
  // Helper untuk menunggu sampai <option> tersedia
  async function waitForOption(selectId, expectedValue, timeout = 3000) {
    return new Promise((resolve) => {
      const interval = 100;
      let waited = 0;

      const check = () => {
        const select = document.getElementById(selectId);
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

  // Pastikan value bertipe string
  const projectValue = data.pesanan_id?.toString() || '';
  const pmValue = data.project_manager_id?.toString() || '';

  // Tunggu sampai option-nya ada
  await waitForOption('formProject', projectValue);
  await waitForOption('formPM', pmValue);

  // Set nilai ke form
  const formProject = document.getElementById('formProject');
  const formPM = document.getElementById('formPM');
  formProject.value = projectValue;
  formPM.value = pmValue;

  document.getElementById('formStartDate').value = data.start_date || '';
  document.getElementById('formDeadline').value = data.deadline || '';

  // Debug log
  console.log('[fillFormData] formProject set to:', formProject.value);
  console.log('[fillFormData] formPM set to:', formPM.value);
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
  loadDropdown('formProject', `${baseUrl}/list/project_won/${owner_id}`, 'pesanan_id', 'project_name');
  loadDropdown('formPM', `${baseUrl}/list/project_manager/${owner_id}`, 'project_manager_id', 'name');
} 


  window.rowTemplate = function (item, index, perPage = 10) {
    const { currentPage } = state[currentDataType];
    const globalIndex = (currentPage - 1) * perPage + index + 1;
  
    return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">
  
    <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
      <span class="font-medium sm:hidden">Tanggal</span>
      ${item.date}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">No.Receipt</span>
      ${item.no_receipt}
    </td>

    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">No.Faktur</span>  
    ${item.no_inv}
    </td>

    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">No.Faktur</span>  
    ${item.nama}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Pelanggan</span>
      ${item.sales_type}
    </td>
  
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Akun</span>
      ${item.account} ${item.number_account} (${item.owner_account})
    </td>
  
    <td class="px-6 py-4 text-right text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Jumlah</span>
      ${formatRupiah(item.nominal)}
    </td>
  
  
    <td class="px-6 py-4 text-sm text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">PIC</span>
      ${item.pic_name  || ''}
    </td>
  
  
    <td class="px-6 py-4 text-sm text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="${getStatusClass(item.status_id)}  px-2 py-1 rounded-full text-xs font-medium">
        ${item.status}
      </span> 
    </td>

    ${item.status_id != 2 ? `
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
  
      <button onclick="event.stopPropagation(); confirmPayment('${item.receipt_id}', 2, '${item.account_id}', '${item.nominal}', '${item.sales_id}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        ✅ Valid
      </button>

      <button onclick="event.stopPropagation(); confirmPayment('${item.receipt_id}', 3, '${item.account_id}', '${item.nominal}', '${item.sales_id}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        ❌ Tidak Valid
      </button>
      </div>
    ` : ''}

  </tr>`;
  };
  

  formHtml = `
<form id="dataform" class="space-y-2">
  <!-- Project -->
  <label for="formProject" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Project</label>
  <select id="formProject" name="pesanan_id" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">Loading...</option>
  </select>

  <!-- PM (Project Manager) -->
  <label for="formPM" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Project Manager</label>
  <select id="formPM" name="project_manager_id" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 
         text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left">
    <option value="">Loading...</option>
  </select>

  <!-- Starting -->
  <label for="formStartDate" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Starting</label>
  <input id="formStartDate" name="start_date" type="date" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
  
  <!-- Deadline -->
  <label for="formDeadline" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Deadline</label>
  <input id="formDeadline" name="deadline" type="date" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
  
</form>

  `
requiredFields = [
    { field: 'formProject', message: 'Project Name is required!' },
    { field: 'formPM', message: 'Project Manager is required!' },
    { field: 'formStartDate', message: 'Starting Date is required!' },
    { field: 'formDeadline', message: 'Deadline is required!' }
  ];  


async function confirmPayment(receipt_id, status_value, bank_id, amount, sales_id) {
  try {
    let selectedBankId = null;
    let nominalValue = 0;

    // 1. Ambil totalRemainingPayment dari API sales_receipt
    const resSales = await fetch(`${baseUrl}/list/sales_receipt/${owner_id}/${sales_id}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    const salesData = await resSales.json();
    console.log(salesData);
  
    const sales_amount = salesData.totalInvoice || 0;
    const sales_remaining = salesData.totalRemainingPayment || 0;

    if (!sales_amount) {
      return Swal.fire('Gagal mengambil data sisa pembayaran.', '', 'error');
    }

    if (status_value !== 3) {
      // 2. Ambil data bank
      const resBank = await fetch(`${baseUrl}/list/finance_account_payment/${owner_id}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });
      const bankData = await resBank.json();
      const banks = bankData?.listData || [];

      if (banks.length === 0) {
        return Swal.fire('Tidak ada data bank tersedia.', '', 'warning');
      }

      const bankOptions = banks.map(bank => {
        const selected = (bank.account_id == bank_id) ? 'selected' : '';
        return `<option value="${bank.account_id}" ${selected}>${bank.account} ${bank.number_account} (${bank.owner_account})</option>`;
      }).join('');

  formHtml = `
<form id="dataform" class="space-y-2">
<p>Validasi akun bank & nominal pembayaran:</p>
  <!-- Project -->
  <label for="swal-bank" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Project</label>
  <select id="swal-bank" name="pesanan_id" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">-- Pilih Bank --</option>
    ${bankOptions}
  </select>

  <!-- Starting -->
  <label for="swal-nominal" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Starting</label>
  <input id="swal-nominal" name="start_date" value="${finance(amount)}" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
  <p style="margin-top: 8px; font-size: 14px;">💡 <b>Total Invoice:</b> Rp ${finance(sales_amount)}</p>
  <p style="margin-top: 8px; font-size: 14px;">💡 <b>Total Belum bayar:</b> Rp ${finance(sales_remaining)}</p>
</form>

  `

      const { isConfirmed, value } = await Swal.fire({
        title: 'Konfirmasi Pembayaran',
        html: formHtml,
        didOpen: () => {
          const nominalInput = document.getElementById('swal-nominal');
          nominalInput.addEventListener('input', function () {
            const angka = this.value.replace(/\D/g, '');
            this.value = finance(angka);
          });
        },
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Ya, Konfirmasi',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const selected = document.getElementById('swal-bank').value;
          const nominalFormatted = document.getElementById('swal-nominal').value;
          const nominal = parseInt(nominalFormatted.replace(/\D/g, ''));

          if (!selected) {
            Swal.showValidationMessage('Silakan pilih bank terlebih dahulu');
          } else if (isNaN(nominal) || nominal <= 0) {
            Swal.showValidationMessage('Nominal pembayaran tidak valid');
          } else if (nominal > sales_remaining) {
            Swal.showValidationMessage(`Nominal tidak boleh lebih dari Rp ${finance(sales_remaining)}`);
          }

          return { selectedBankId: selected, nominal };
        }
      });

      if (!isConfirmed || !value) return;

      selectedBankId = value.selectedBankId;
      nominalValue = value.nominal;

    } else {
      // Jika status 3 (batal)
      const { isConfirmed } = await Swal.fire({
        title: 'Konfirmasi Pembatalan Pembayaran',
        text: 'Apakah Anda yakin ingin membatalkan pembayaran ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Batal',
      });
      if (!isConfirmed) return;
    }

    // 3. Siapkan payload
    const body = {
      status_id: status_value,
      user_id: user_id,
    };

    if (status_value !== 3) {
      body.account_id = selectedBankId;
      body.nominal = nominalValue;
    } else {
      body.account_id = bank_id;
      body.nominal = amount;
    }

    // 4. Kirim ke API
    const response = await fetch(`${baseUrl}/update/sales_receipt_status/${receipt_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (result?.data?.success) {
      Swal.fire({
        title: 'Berhasil!',
        text: result.data.message || 'Status berhasil diperbarui.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      fetchAndUpdateData();
    } else {
      throw new Error(result.data?.message || 'Gagal memperbarui status');
    }

  } catch (error) {
    Swal.fire({
      title: 'Gagal',
      text: error.message,
      icon: 'error',
    });
    fetchAndUpdateData();
  }
}

async function loadBankDropdown() {
  try {
    const res = await fetch(`${baseUrl}/list/payment_method/${owner_id}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    const data = await res.json();

    const menu = document.getElementById('dropdownBankMenu');
    menu.innerHTML = ''; // clear isi lama

    if (data.listData && data.listData.length > 0) {
      data.listData.forEach(bank => {
        const btn = document.createElement('button');
        btn.className = "flex flex-col text-left w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700";
        btn.innerHTML = `
          <span class="font-medium">${bank.account} - ${bank.tag}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">${bank.owner_account} (${bank.number_account})</span>
        `;
        btn.onclick = () => selectBank(bank);
        menu.appendChild(btn);
      });

      // separator + tombol reset
      const divider = document.createElement('div');
      divider.className = "border-t border-gray-200 dark:border-gray-700 my-1";
      menu.appendChild(divider);

      const allBtn = document.createElement('button');
      allBtn.className = "flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700";
      allBtn.innerHTML = `<span>Semua Bank</span>`;
      allBtn.onclick = () => selectBank(null);
      menu.appendChild(allBtn);
    } else {
      menu.innerHTML = `<div class="px-4 py-2 text-sm text-gray-500">Tidak ada data bank</div>`;
    }
  } catch (err) {
    console.error('Gagal load bank:', err);
  }
}

function selectBank(bank) {
  const label = document.getElementById('dropdownBankLabel');
  if (bank) {
    label.textContent = `${bank.account} - ${bank.tag}`;
    filterData(`bank=${bank.account_id}`);
  } else {
    label.textContent = 'Semua Bank';
    filterData('');
  }
  toggleBankDropdown(); // tutup dropdown setelah pilih
}

function toggleBankDropdown() {
  document.getElementById('dropdownBankMenu').classList.toggle('hidden');
}

// load pertama kali
loadBankDropdown();





