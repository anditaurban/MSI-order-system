pagemodule = 'Shipment';
colSpanCount = 9;
setDataType('sales_shipment');
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
    const typeValue = data.type_id?.toString() || '';
    await waitForOption('formType', typeValue);
    const formType = document.getElementById('formType');
    formType.value = typeValue;
  
    document.getElementById('formNama').value = data.nama || '';
    document.getElementById('formAlias').value = data.alias || '';
    document.getElementById('formPhone').value = data.phone || '';
    document.getElementById('formWA').value = data.whatsapp || '';
    document.getElementById('formEmail').value = data.email || '';
    document.getElementById('formNpwp').value = data.no_npwp || '';
    document.getElementById('formWeb').value = data.website || '';
    document.getElementById('formCity').value = data.city_name || '';
    document.getElementById('formAlamat').value = data.alamat || '';
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
  loadDropdown('formProject', `${baseUrl}/list/client_type/${owner_id}`, 'type_id', 'type');
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
    <span class="font-medium sm:hidden">No.Shipment</span>  
    ${item.no_shipment}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">No.Paket</span>
      ${item.no_package}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">No.Faktur</span>
      ${item.no_inv}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Pelanggan</span>
      ${item.nama}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Pelanggan</span>
      ${item.sales_type}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Resi</span>
      ${item.shipment_receipt}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Ekspedisi</span>
      ${item.courier}
    </td>
  
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Ekspedisi</span>
      ${item.courier_note}
    </td>
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">PIC</span>
      ${item.pic_name}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="${getStatusClass(item.status_id)}  px-2 py-1 rounded-full text-xs font-medium">
        ${item.status}
      </span>     
    </td>
          <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">

        <button onclick="event.stopPropagation(); showShipmentUpdateForm('${item.shipment_id}', '${item.no_inv}', '${item.no_package}', '${item.courier_id}', '${item.courier_note}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
          📝 Input Resi
        </button>
        <button onclick="event.stopPropagation(); printShippingLabel('${item.shipment_id}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
          🖨️ Print Shipping Label
        </button>
      </div>
  </tr>`;
  };

  formHtml = `
<form id="dataform" class="space-y-2">

  <label for="formNama" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Contact Name</label>
  <input id="formNama" name="nama" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
  

  <label for="formType" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Type</label>
  <select id="formType" name="type" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 
         text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left">
    <option value="">Loading...</option>
  </select>

  <label for="formAlias" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Alias</label>
  <input id="formAlias" name="alias" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
  
  <label for="formPhone" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Phone</label>
  <input id="formPhone" name="phone" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
  
  <label for="formWA" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Whatsapp</label>
  <input id="formWA" name="whatsapp" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <label for="formEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Email</label>
  <input id="formEmail" name="email" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <label for="formNpwp" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Tax ID</label>
  <input id="formNpwp" name="no_npwp" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <label for="formWeb" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Website</label>
  <input id="formWeb" name="website" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <label for="formCity" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">City</label>
  <input id="formCity" name="city_name" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
  
  <label for="formAlamat" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Address</label>
  <input id="formAlamat" name="alamat" type="text" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
</form>

  `
requiredFields = [
    { field: 'formProject', message: 'Project Name is required!' },
    { field: 'formPM', message: 'Project Manager is required!' },
    { field: 'formStartDate', message: 'Starting Date is required!' },
    { field: 'formDeadline', message: 'Deadline is required!' }
  ];  

function printShippingLabel(shipment_id) {
  Swal.fire({
    title: 'Cetak Label Pengiriman',
    text: 'Pilih metode pencetakan label:',
    showCancelButton: true,
    showConfirmButton: false,
    confirmButtonText: 'Download PDF',
    cancelButtonText: 'Print (Langsung)',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      // === Download PDF ===
      Swal.fire({
        title: 'Menyiapkan PDF...',
        html: 'Silakan tunggu, file akan terunduh otomatis.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();

          // Buat iframe tersembunyi
          const iframe = document.createElement("iframe");
          iframe.src = `print_shipping_label.html?ids=${shipment_id}`;
          iframe.style.width = "0";
          iframe.style.height = "0";
          iframe.style.border = "none";
          document.body.appendChild(iframe);

          // Tunggu 3 detik lalu tampilkan notifikasi selesai
          setTimeout(() => {
            Swal.close();
            Swal.fire('Berhasil', 'Label berhasil diunduh sebagai PDF.', 'success');
          }, 3000);
        }
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // === Langsung Print (buka tab baru) ===
      window.open(`print_shipping_label.html?ids=${shipment_id}`, '_blank');
    }
  });
}


async function showShipmentUpdateForm(
  shipment_id = null,
  no_inv = null,
  no_package = null,
  courier_id = null,
  courier_note = null
) {
  try {
    let shipmentList = [];

    // Ambil daftar kurir dari API
    const courierRes = await fetch(`${baseUrl}/list/courier/${owner_id}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    const courierJson = await courierRes.json();
    const couriers = courierJson?.listData || [];

    if (shipment_id && no_inv && no_package) {
      shipmentList.push({
        shipment_id,
        no_package,
        no_inv,
        courier_id: courier_id ?? '',
        courier_note: courier_note ?? '',
        shipment_receipt: '',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      const res = await fetch(`${baseUrl}/counting/sales_package_unshipped/${owner_id}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });
      const result = await res.json();
      const countData = result?.countData;

      if (!countData || !countData.shipments || countData.shipments.length === 0) {
        return Swal.fire('Info', 'Tidak ada shipment yang perlu diupdate.', 'info');
      }

      shipmentList = countData.shipments.map(s => ({
        shipment_id: s.shipment_id,
        no_package: s.no_package,
        no_inv: s.no_inv,
        courier_id: '',
        courier_note: '',
        shipment_receipt: '',
        date: new Date().toISOString().split('T')[0]
      }));

      
    }

    // Generate form HTML
    let formHtml = `<form id="dataform" class="space-y-4 text-left text-sm text-gray-700 dark:text-gray-200">`;

    shipmentList.forEach((s, i) => {
      const courierOptions = couriers.map(c => {
        const selected = c.courier_id == s.courier_id ? 'selected' : '';
        return `<option value="${c.courier_id}" ${selected}>${c.courier}</option>`;
      }).join('');

      formHtml += `
        <div class="border border-gray-300 dark:border-gray-600 p-3 rounded-md">
          <div class="mb-2 font-medium">Shipment ID ${s.shipment_id}</div>
          <div class="text-xs text-gray-500 mb-2">
            Paket: <strong>${s.no_package}</strong><br />
            Invoice: <strong>${s.no_inv}</strong>
          </div>

          <!-- Kurir -->
          <label for="courier_${i}" class="block mb-1">Kurir</label>
          <select id="courier_${i}" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white">
            <option value="">-- Pilih Kurir --</option>
            ${courierOptions}
          </select>

          <!-- Catatan Kurir -->
          <label for="note_${i}" class="block mt-3 mb-1">Catatan Kurir</label>
          <input id="note_${i}" type="text" placeholder="Contoh: Taruh di pos satpam"
            value="${s.courier_note || ''}"
            class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white" />

          <!-- Nomor Resi -->
          <label for="resi_${i}" class="block mt-3 mb-1">Nomor Resi</label>
          <input id="resi_${i}" type="text" placeholder="No. Resi"
            value="${s.shipment_receipt || ''}"
            class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white" />
        </div>
      `;
    });

    formHtml += `</form>`;

    const { isConfirmed } = await Swal.fire({
      title: 'Input Pengiriman',
      html: formHtml,
      confirmButtonText: 'Update Shipment',
      width: 600,
      focusConfirm: false,
      preConfirm: () => {
        shipmentList.forEach((s, i) => {
          s.courier_id = parseInt(document.getElementById(`courier_${i}`).value) || null;
          s.courier_note = String(document.getElementById(`note_${i}`).value || '-');
          s.shipment_receipt = String(document.getElementById(`resi_${i}`).value || '-');
        });
      }
    });

    console.log(shipmentList);

    if (isConfirmed) {
      updateBulkShipment(shipmentList.map(s => ({
        user_id: owner_id,
        courier_id: s.courier_id,
        courier_note: s.courier_note,
        shipment_receipt: s.shipment_receipt,
        shipment_id: s.shipment_id
      })));
    }

  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Gagal mengambil data shipment atau courier.', 'error');
  }
}




async function updateBulkShipment(shipmentList) {
  try {
    const promises = shipmentList.map(async (s) => {
      const response = await fetch(`${baseUrl}/update/sales_shipment/${s.shipment_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courier: s.courier,
          courier_id: s.courier_id,
          courier_note: s.courier_note,
          shipment_receipt: s.shipment_receipt,
          user_id: user_id
        })
      });

      const result = await response.json();

      if (!result?.data?.success) {
        throw new Error(`Gagal update shipment ID ${s.shipment_id}: ${result?.data?.message || 'Unknown error'}`);
      }

      return result.data;
    });

    const results = await Promise.all(promises);

    Swal.fire({
      title: 'Berhasil!',
      text: `${results.length} shipment berhasil diperbarui.`,
      icon: 'success'
    });
    fetchAndUpdateData();

  } catch (error) {
    console.error(error);
    Swal.fire('Error', error.message, 'error');
  }
}


function promptPrintCombinedPDF(shipmentIds) {
  Swal.fire({
    title: 'Cetak Semua Label?',
    text: 'Ingin menggabungkan semua label dalam satu file PDF?',
    showCancelButton: true,
    confirmButtonText: 'Gabung & Download',
    cancelButtonText: 'Nanti Saja'
  }).then((result) => {
    if (result.isConfirmed) {
      printCombinedShippingLabels(shipmentIds);
    }
  });
}

function printCombinedShippingLabels(shipmentIds) {
  const param = shipmentIds.join(',');
  window.open(`/print/shipping_label_combined.html?ids=${param}`, '_blank');
}






