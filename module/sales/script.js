pagemodule = 'Sales'
colSpanCount = 9;
setDataType('sales');
fetchAndUpdateData();

document.getElementById('addButton').addEventListener('click', () => {
  // showFormModal();
  // loadDropdownCall();
  loadModuleContent('sales_invoice');
});

function loadSummary(dataSummary) {
  // console.log("Data Summary:", dataSummary);

  // contoh isi ke elemen HTML tertentu
  document.getElementById("unpaid").textContent = dataSummary.menunggu_pembayaran;
  document.getElementById("partialpaid").textContent = dataSummary.bayar_sebagian;
  document.getElementById("unverified").textContent = dataSummary.sedang_diverifikasi;
  document.getElementById("process").textContent = dataSummary.sedang_diproses;
  document.getElementById("unsalesman").textContent = dataSummary.tanpa_salesman;
}

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
    // console.log(item.status_id);
  
    return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">
    <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
      <span class="font-medium sm:hidden">Tanggal</span>
      ${item.date}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">No.Faktur</span>
      ${item.no_inv}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Pelanggan</span>
      ${item.customer}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Pelanggan</span>
      ${item.sales_type}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b text-right sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Jumlah</span>
      ${formatRupiah(item.total)}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b text-right sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Sisa Bayar</span>
      ${formatRupiah(item.remaining_payment)}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">PIC</span>
      ${item.pic_name}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">PIC</span>
      ${item.salesman || 'N/A'}
    </td>
  
    <td class="px-6 py-4 text-center text-sm text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="${getStatusClass(item.status_id)}  px-2 py-1 rounded-full text-xs font-medium">
        ${item.status}
      </span>
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
        <button onclick="event.stopPropagation(); loadModuleContent('sales_invoice', '${item.sales_id}', '${item.no_inv}', '${item.customer_id}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
          👁️ View Order
        </button>

      <button onclick="event.stopPropagation(); addSales('${item.sales_id}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        👔 Add Salesman
      </button>
    ${item.status_id === 2 || item.status_id === 6 ? `
      <button onclick="event.stopPropagation(); addPayment('${item.sales_id}', '${item.remaining_payment}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        💰 Add Payment
      </button>
    ` : ''}

${(item.status_id === 2 || user.role === 'superadmin') ? `
  <button onclick="event.stopPropagation(); deleteSales(${item.sales_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
    🗑 Delete Order
  </button>
` : ''}

      </div>
    </td>
  </tr>`;
  };
  
formHtml = ``

requiredFields = [
    { field: 'formProject', message: 'Project Name is required!' },
    { field: 'formPM', message: 'Project Manager is required!' },
    { field: 'formStartDate', message: 'Starting Date is required!' },
    { field: 'formDeadline', message: 'Deadline is required!' }
  ];  

async function addPayment(sales_id, nominal) {
  try {
    const res = await fetch(`${baseUrl}/list/payment_method/${owner_id}`, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });

    const { listData } = await res.json();

    if (!listData || listData.length === 0) {
      Swal.fire('Gagal', 'Tidak ada metode pembayaran tersedia.', 'error');
      return;
    }

    const optionsHtml = listData.map(acc => `
      <option value="${acc.account_id}">
        ${acc.account} - ${acc.owner_account} (${acc.number_account})
      </option>
    `).join('');

    const { value: result } = await Swal.fire({
      title: 'Add Payment',
      html: `<form id="dataform" class="space-y-2" autocomplete="off">
<strong>Total Tagihan:</strong> ${formatRupiah(nominal)}

  <label for="swal-date" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Date</label>
  <input id="swal-date" name="date" type="date" value="${new Date().toISOString().split('T')[0]}" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <!-- Informasi Total Tagihan -->
  <div class="text-sm text-left text-gray-600 dark:text-gray-300">
    
  </div>

  <div class="flex items-center gap-2">
    <div class="w-full">
      <label for="swal-nominal" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Amount</label>
      <input id="swal-nominal" name="amount" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    </div>
    <div class="mt-6">
      <label class="text-xs whitespace-nowrap">
        <input type="checkbox" id="swal-fullpay" class="mr-1">
        Full Payment
      </label>
    </div>
  </div>

  <label for="swal-account" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Account</label>
  <select id="swal-account" name="account" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 
         text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left">
    <option value="">--- Pilih Akun Pembayaran ---</option>
    ${optionsHtml}
  </select>

  <label for="swal-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Notes</label>
  <input id="swal-notes" name="notes" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
</form>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      didOpen: () => {
        const inputNominal = document.getElementById('swal-nominal');
        const checkboxFullpay = document.getElementById('swal-fullpay');

        function formatRupiah(value) {
          const clean = value.replace(/\D/g, '');
          return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        inputNominal.addEventListener('input', function () {
          this.value = formatRupiah(this.value);
        });

        checkboxFullpay.addEventListener('change', function () {
          if (this.checked) {
            inputNominal.value = formatRupiah(nominal.toString());
          } else {
            inputNominal.value = '';
          }
        });
      },
      preConfirm: () => {
        const date = document.getElementById('swal-date').value;
        const nominalRaw = document.getElementById('swal-nominal').value;
        const account_id = document.getElementById('swal-account').value;
        const notes = document.getElementById('swal-notes').value;

        const numericNominal = parseInt(nominalRaw.replace(/\./g, '')) || 0;

        if (!date || !numericNominal || !account_id) {
          Swal.showValidationMessage(`Tanggal, nominal, dan akun pembayaran wajib diisi.`);
          return false;
        }

        if (numericNominal > nominal) {
          Swal.showValidationMessage(`Nominal tidak boleh lebih dari Rp ${nominal.toLocaleString('id-ID')}`);
          return false;
        }

        return {
          date,
          nominal: numericNominal,
          account_id: parseInt(account_id),
          notes: notes || "-"
        };
      }
    });

    if (!result) return;

    const payload = {
      owner_id,
      sales_id,
      account_id: result.account_id,
      date: result.date,
      nominal: result.nominal,
      notes: result.notes
    };

    const resPost = await fetch(`${baseUrl}/add/sales_receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await resPost.json();

    if (resPost.ok) {
      Swal.fire('Sukses', 'Pembayaran berhasil ditambahkan.', 'success');
      fetchAndUpdateData();
      // loadSalesBadge();
    } else {
      Swal.fire('Gagal', data.message || 'Terjadi kesalahan saat menyimpan pembayaran.', 'error');
    }

  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Terjadi kesalahan saat memproses.', 'error');
  }
}

async function addPackage(sales_id) {
  try {
    const { value: result } = await Swal.fire({
      title: 'Tambah Paket Penjualan',
      html: `
        <form id="packageForm" class="space-y-3 text-left">
          <label for="swal-date" class="block text-sm font-medium text-gray-700">Tanggal</label>
          <input id="swal-date" name="date" type="date" 
            value="${new Date().toISOString().split('T')[0]}"
            class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

          <label for="swal-notes" class="block text-sm font-medium text-gray-700">Catatan</label>
          <textarea id="swal-notes" name="notes"
            class="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3">Di packing ya</textarea>
        </form>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      preConfirm: () => {
        const date = document.getElementById('swal-date').value;
        const notes = document.getElementById('swal-notes').value.trim();

        if (!date) {
          Swal.showValidationMessage('Tanggal wajib diisi.');
          return false;
        }

        return { date, notes };
      }
    });

    if (!result) return;

    const payload = {
      owner_id,
      sales_id,
      date: result.date,
      notes: result.notes || "-"
    };

    const res = await fetch(`${baseUrl}/add/sales_package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire('Sukses', 'Paket berhasil ditambahkan.', 'success');
      fetchAndUpdateData(); // refresh tampilan jika perlu
    } else {
      Swal.fire('Gagal', data.message || 'Terjadi kesalahan saat menambahkan paket.', 'error');
    }

  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Terjadi kesalahan saat memproses.', 'error');
  }
}

async function addSales(sales_id) {
  try {
    const res = await fetch(`${baseUrl}/list/salesman/${owner_id}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    const { listData } = await res.json();

    if (!listData || listData.length === 0) {
      Swal.fire('Gagal', 'Tidak ada data salesman tersedia.', 'error');
      return;
    }

    const optionsHtml = listData.map(salesman => `
      <option value="${salesman.salesman_id}">
        ${salesman.name} - ${salesman.role} (${salesman.level})
      </option>
    `).join('');

    const { value: selectedSalesman } = await Swal.fire({
      title: 'Pilih Salesman',
      html: `
        <label for="swal-salesman" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Salesman</label>
        <select id="swal-salesman" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 
            text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">--- Pilih Salesman ---</option>
          ${optionsHtml}
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      preConfirm: () => {
        const salesmanId = document.getElementById('swal-salesman').value;
        if (!salesmanId) {
          Swal.showValidationMessage(`Salesman wajib dipilih.`);
          return false;
        }
        return parseInt(salesmanId);
      }
    });

    if (!selectedSalesman) return;

    const payload = {
      salesman_id: selectedSalesman
    };

    const resPost = await fetch(`${baseUrl}/update/salesman/${sales_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await resPost.json();

    if (resPost.ok) {
      Swal.fire('Sukses', 'Salesman berhasil diperbarui.', 'success');
      fetchAndUpdateData?.();
    } else {
      Swal.fire('Gagal', data.message || 'Terjadi kesalahan saat memperbarui salesman.', 'error');
    }

  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Terjadi kesalahan saat memproses.', 'error');
  }
}

async function deleteSales(sales_id) {
  const { value: reason } = await Swal.fire({
    title: 'Batalkan Penjualan?',
    input: 'textarea',
    inputLabel: 'Alasan pembatalan',
    inputPlaceholder: 'Tulis alasan di sini...',
    inputAttributes: {
      'aria-label': 'Alasan pembatalan'
    },
    showCancelButton: true,
    confirmButtonText: 'Kirim',
    cancelButtonText: 'Batal',
    inputValidator: (value) => {
      if (!value) {
        return 'Alasan tidak boleh kosong!';
      }
    }
  });

  if (!reason) return;

  try {
    const response = await fetch(`${baseUrl}/delete/sales/${sales_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({ notes: reason })
    });

    const result = await response.json();

    if (result.data?.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dibatalkan',
        text: result.data.message,
        timer: 2000,
        showConfirmButton: false
      });

      // Refresh table atau redirect jika perlu
      fetchAndUpdateData();
    } else {
      throw new Error(result.data?.message || 'Gagal membatalkan penjualan');
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.message || 'Terjadi kesalahan'
    });
  }
}



