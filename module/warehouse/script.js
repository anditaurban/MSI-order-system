// Inisialisasi
pagemodule = "Warehouse";
colSpanCount = 9;
setDataType("werehouse");
fetchAndUpdateData();

window.rowTemplate = function (item, index, perPage = 10) {
  const { currentPage } = state[currentDataType];
  const globalIndex = (currentPage - 1) * perPage + index + 1;

  // Deteksi status (Asumsi list data juga mengembalikan 'on' atau 'off')
  const isActive = item.status_active === "on";

  return `
    <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">
      <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
        <span class="font-medium sm:hidden">Nama</span>${item.werehouse}
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
        <span class="font-medium sm:hidden">Email</span>${item.werehouse_code}
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
        <span class="font-medium sm:hidden">Whatsapp</span>${item.phone}
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
        <span class="font-medium sm:hidden">Alamat</span>${item.address}
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
        ${item.region_name}
      </td>
      
      <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
        ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }">
        ${isActive ? "Active" : "Inactive"}
      </span>
      </td>

      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
        <button onclick="event.stopPropagation(); loadModuleContent('warehouse_form', '${
          item.werehouse_id
        }', '${
    item.werehouse
  }');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">✏️ Edit Contact</button>
        
        
        
        <button onclick="event.stopPropagation(); openWhatsAppChat(${
          item.whatsapp
        })" class="block w-full text-left px-4 py-2 hover:bg-gray-100">💬 Chat via WA</button>
        
        ${
          isActive
            ? `<button onclick="toggleProductStatus('${item.werehouse_id}', 'off')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">🔴 Inactivate</button>`
            : `<button onclick="toggleProductStatus('${item.werehouse_id}', 'on')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-green-600">🟢 Activate</button>`
        }
        
        <button onclick="event.stopPropagation(); handleDelete(${
          item.werehouse_id
        })" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">🗑 Delete Contact</button>
      </div>
    </tr>
  `;
};

document.getElementById("addButton").addEventListener("click", async () => {
  loadModuleContent("warehouse_form");
});

function toggleProductStatus(id, newStatus) {
  // newStatus berisi string "on" atau "off"
  const actionText = newStatus === "on" ? "mengaktifkan" : "menonaktifkan";

  Swal.fire({
    title: `Yakin ingin ${actionText} Gudang ini?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      // Payload disesuaikan: mengirim status_active ('on'/'off')
      const payload = { status_active: newStatus };

      fetch(`${baseUrl}/update/werehouse_status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Response Update:", data); // Debugging

          // Validasi response baru: cek data.data.status_active
          if (data.data && data.data.status_active) {
            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: data.data.message || "Status berhasil diperbarui",
              timer: 1500,
              showConfirmButton: false,
            });
            // Refresh tabel
            fetchAndUpdateData();
          } else {
            throw new Error(
              data.message ||
                "Gagal memperbarui status (Format Response Invalid)"
            );
          }
        })
        .catch((err) => {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: err.message || "Terjadi kesalahan pada server",
          });
        });
    }
  });
}
