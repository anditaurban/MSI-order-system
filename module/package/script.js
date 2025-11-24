pagemodule = "Package";
colSpanCount = 9;
setDataType("sales_package");
fetchAndUpdateData();

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
    <span class="font-medium sm:hidden">No.Package</span>  
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
    <span class="font-medium sm:hidden">Kemitraan</span>  
    ${item.business_category}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Tipe</span>
      ${item.sales_type}
    </td>
  
  
     <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Catatan</span>  
    ${item.notes}
    </td>
  
     <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">PIC</span>  
    ${item.pic_name || ""}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="${getStatusClass(
        item.status_id
      )}  px-2 py-1 rounded-full text-xs font-medium">
        ${item.status}
      </span>      
    </td>
    
${
  ![2, 4].includes(item.status_id)
    ? `    
    <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
   ${
     item.status_id === 1
       ? `
      <button onclick="event.stopPropagation(); updatePackageStatus('${item.package_id}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        📦 Process Packing
      </button>
      `
       : ""
   }
      ${
        item.pic_name && item.pic_name !== "null"
          ? `
      <button onclick="event.stopPropagation(); printPackingList('${item.package_id}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        🖨️ Print Packing List
      </button>
       `
          : ""
      }
      ${
        item.status_id === 5
          ? `
      <button onclick="event.stopPropagation(); addShipment('${item.package_id}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        🚚 Process Shipping
      </button>
       `
          : ""
      }

       <button onclick="event.stopPropagation(); loadModuleContent('package_form', '${
         item.package_id
       }');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        🔄 Update Packing
       </button>
      </div>
 `
    : ""
}
  </tr>`;
};

async function updatePackageStatus(package_id) {
  try {
    // ambil data packageman
    const resPackageman = await fetch(
      `${baseUrl}/list/packageman/${owner_id}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );
    const dataPackageman = await resPackageman.json();

    if (!dataPackageman.listData || dataPackageman.listData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak ada data",
        text: "Data packageman belum tersedia.",
      });
      return;
    }

    // mapping ke format { value: 'nama', text: 'nama (role)' }
    const options = {};
    dataPackageman.listData.forEach((pm) => {
      options[pm.packageman_id] = `${pm.name} (${pm.role})`;
    });

    // tampilkan swal dengan select
    const { value: packageman_id } = await Swal.fire({
      title: "Pilih PIC",
      input: "select",
      inputOptions: options,
      inputPlaceholder: "Pilih karyawan",
      showCancelButton: true,
      confirmButtonText: "Update Status",
      inputValidator: (value) => {
        if (!value) {
          return "PIC wajib dipilih!";
        }
      },
    });

    if (!packageman_id) return;

    // kirim update
    const res = await fetch(
      `${baseUrl}/update/sales_package_status/${package_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          packageman_id,
          status_id: 5,
        }),
      }
    );

    const result = await res.json();
    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Status paket berhasil diperbarui.",
      });
      fetchAndUpdateData();
    } else {
      throw new Error(result.message || "Gagal memperbarui status.");
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: error.message,
    });
  }
}

async function printPackingList(package_id) {
  try {
    const response = await fetch(
      `${baseUrl}/detail/sales_package/${package_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    const result = await response.json();
    const data = result?.detail;
    if (!data) throw new Error("Data paket tidak ditemukan");

    // Tampilkan pilihan aksi ke user
    const { isConfirmed, dismiss } = await Swal.fire({
      title: "Cetak Packing List",
      text: "Pilih metode pencetakan:",
      icon: "question",
      showCancelButton: true,
      showConfirmButton: false,
      confirmButtonText: "Download PDF",
      cancelButtonText: "Print Langsung",
      reverseButtons: true,
    });

    if (isConfirmed) {
      const url = `print_packing_list.html?ids=${package_id}`;
      Swal.fire({
        title: "Menyiapkan PDF...",
        html: "File akan diunduh otomatis.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();

          const iframe = document.createElement("iframe");
          iframe.src = url + "&mode=download";
          iframe.style.width = "0";
          iframe.style.height = "0";
          iframe.style.border = "none";
          document.body.appendChild(iframe);

          setTimeout(() => {
            Swal.close();
            Swal.fire("Berhasil", "Packing List berhasil diunduh.", "success");
          }, 3000);
        },
      });
    } else if (dismiss === Swal.DismissReason.cancel) {
      // === Print Langsung (open tab) ===
      window.open(`print_packing_list.html?ids=${package_id}`, "_blank");
    }
  } catch (error) {
    Swal.fire({
      title: "Gagal",
      text: error.message,
      icon: "error",
    });
  }
}

function printPDFPackage(package_id) {
  const printWindow = window.open(
    `print_packing_list.html?ids==${package_id}`,
    "_blank"
  );
}

async function printBulkPackingList() {
  try {
    const res = await fetch(
      `${baseUrl}/counting/sales_package_unpack/${owner_id}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    const result = await res.json();
    const ids = result?.countData?.package_ids;

    if (!ids || ids.length === 0) {
      return Swal.fire(
        "Tidak Ada Data",
        "Semua paket sudah diproses atau tidak ditemukan.",
        "info"
      );
    }

    const idString = ids.join(",");
    const url = `packing_list_combined.html?ids=${idString}`;

    // Pilih metode cetak
    Swal.fire({
      title: "Cetak Packing List",
      text: "Pilih metode pencetakan:",
      showCancelButton: true,
      confirmButtonText: "Download PDF",
      cancelButtonText: "Print (Langsung)",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // === Download PDF (gunakan iframe tersembunyi) ===
        Swal.fire({
          title: "Menyiapkan PDF...",
          html: "Silakan tunggu, file akan diunduh otomatis.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();

            const iframe = document.createElement("iframe");
            iframe.src = url + "&mode=download";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "none";
            document.body.appendChild(iframe);

            setTimeout(() => {
              Swal.close();
              Swal.fire("Selesai", "PDF berhasil diunduh.", "success");
            }, 3000);
          },
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // === Buka halaman print langsung ===
        window.open(url, "_blank");
      }
    });
  } catch (err) {
    console.error("❌ Gagal mengambil data paket", err);
    Swal.fire("Error", "Terjadi kesalahan saat mengambil data paket.", "error");
  }
}

async function addShipment(package_id) {
  try {
    const response = await fetch(
      `${baseUrl}/update/sales_package_status/${package_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({ status_id: 2, user_id: user_id }),
      }
    );

    const result = await response.json();
    const data = result?.data;

    if (response.ok && data?.success) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Paket berhasil diubah menjadi shipment.\nNomor: ${data.no_shipment}`,
      });
      fetchAndUpdateData();
      return data;
    } else {
      throw new Error(data?.message || "Gagal memperbarui status");
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err.message || "Terjadi kesalahan saat menghubungi server",
    });
  }
}
