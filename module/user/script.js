pagemodule = 'User'
colSpanCount = 9;
setDataType('user');
fetchAndUpdateData();

var REMOTE_AUTH_TOKEN = 'DpacnJf3uEQeM7HN'; // Bearer token

window.rowTemplate = function (item, index, perPage = 10) {
  const { currentPage } = state[currentDataType];
  const globalIndex = (currentPage - 1) * perPage + index + 1;
  
  // Ubah object item menjadi string yang aman untuk atribut HTML
  const itemString = encodeURIComponent(JSON.stringify(item));
  
  return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">  
     <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Name</span>  
    ${item.name}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Email</span>
      ${item.email}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Phone</span>
      ${item.wa_login}
    </td>
 
    <td class="px-6 py-4 text-sm text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Role</span>
      ${item.role}
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
       <button onclick="event.stopPropagation(); handleEdit('${itemString}')" class="block w-full text-left px-4 py-2 hover:bg-gray-100">✏️ Edit User</button>
        <button onclick="event.stopPropagation(); handleDelete(${item.user_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Delete User
        </button>
      </div>
    </td>
  </tr>`;
};

// --- Event Listener Tombol Tambah ---
document.getElementById('addButton').addEventListener('click', () => {
  openUserModal(); // Panggil tanpa parameter untuk mode Tambah (POST)
});

// --- Fungsi Terpadu untuk Form Modal (Add & Edit) ---
// --- Fungsi Terpadu untuk Form Modal (Add & Edit) ---
async function openUserModal(userId = null, existingData = {}) {
  const isEditing = !!userId;
  const title = isEditing ? "Edit Pengguna" : "Tambah Pengguna";

  // FILTER "NULL" DILETAKKAN DI SINI (SEBELUM SWAL.FIRE)
  const defaultName = existingData.name && existingData.name !== 'null' ? existingData.name : '';
  const defaultPhone = existingData.wa_login && existingData.wa_login !== 'null' ? existingData.wa_login : '';
  const defaultEmail = existingData.email && existingData.email !== 'null' ? existingData.email : '';
  const defaultRole = existingData.role && existingData.role !== 'null' ? existingData.role : '';

  const { isConfirmed } = await Swal.fire({
    title: title,
    html: `
      <div class="space-y-3 text-left">
        <label class="block text-sm font-medium text-gray-700">Nama</label>
        <input id="swal-nama" type="text" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value="${defaultName}">

        <label class="block text-sm font-medium text-gray-700">Phone</label>
        <input id="swal-phone" type="text" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value="${defaultPhone}">

        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input id="swal-email" type="email" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value="${defaultEmail}">

        <label class="block text-sm font-medium text-gray-700">Role</label>
        <select id="swal-role" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">Pilih Role</option>
          <option value="superadmin" ${defaultRole === 'superadmin' ? 'selected' : ''}>Super Admin</option>
          <option value="sales" ${defaultRole === 'sales' ? 'selected' : ''}>Sales</option>
          <option value="finance" ${defaultRole === 'finance' ? 'selected' : ''}>Finance</option>
          <option value="packing" ${defaultRole === 'packing' ? 'selected' : ''}>Packing</option>
          <option value="shipping" ${defaultRole === 'shipping' ? 'selected' : ''}>Shipping</option>
          <option value="viewer" ${defaultRole === 'viewer' ? 'selected' : ''}>Viewer</option>
        </select>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Simpan",
    cancelButtonText: "Batal",
    preConfirm: async () => {
      // 1. AMBIL NILAI DARI INPUT DI SINI
      const nama = document.getElementById("swal-nama").value.trim();
      const phone = document.getElementById("swal-phone").value.trim();
      const email = document.getElementById("swal-email").value.trim();
      const role = document.getElementById("swal-role").value;

      // 2. Validasi Form
      if (!nama || !phone || !email || !role) {
        Swal.showValidationMessage("Semua field wajib diisi!");
        return false;
      }

      // 3. Susun Payload
      const payload = {
        app_ids: [17],          // Array of Numbers
        company: "MKI",
        level: "owner",
        owner_id: 4464,         // Number
        nama: nama,
        phone: phone,
        email: email,
        role: role
      };

      if (isEditing) {
        payload.user_id = userId;
      }

      const endpoint = isEditing 
        ? `https://auth.katib.cloud/update/newregister/${userId}` 
        : `https://auth.katib.cloud/add/newregister`;
      const method = isEditing ? 'PUT' : 'POST';

      // 4. Proses Fetch ke Server
      try {
        const res = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${REMOTE_AUTH_TOKEN}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Status ${res.status}`);
        }

        return true; // Menandakan request berhasil
      } catch (err) {
        console.error("Error CUD User:", err);
        Swal.showValidationMessage(`Gagal menghubungi server: ${err.message}`);
        return false;
      }
    },
  });

  // 5. Tanggapan Setelah Sukses
  if (isConfirmed) {
    Swal.fire(
      "Sukses!",
      `Data pengguna berhasil di${isEditing ? 'perbarui' : 'tambahkan'}!`,
      "success"
    );
    if (typeof fetchAndUpdateData === 'function') fetchAndUpdateData();
  }
}

// --- Handler untuk Tombol Edit ---
// --- Handler untuk Tombol Edit ---
function handleEdit(itemString) {
  // Decode string kembali menjadi objek JavaScript
  const userData = JSON.parse(decodeURIComponent(itemString));
  
  // Langsung buka modal dengan data yang valid
  openUserModal(userData.user_id, userData);
}

// --- Handler untuk Tombol Delete ---
async function handleDelete(userId) {
  const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data pengguna ini akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
  });

  if (!result.isConfirmed) return;

  const endpoint = `https://auth.katib.cloud/delete/newregister/${userId}`;
  
  // Key "company" ditambahkan di sini sesuai dengan screenshot API Postman
  const bodyData = { 
      user_id: userId,
      company: "MKI" 
  };

  Swal.fire({
      title: 'Menghapus...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
  });

  try {
     const response = await fetch(endpoint, {
         method: 'PUT',
         headers: {
             'Authorization': `Bearer ${REMOTE_AUTH_TOKEN}`, // Pastikan variabel ini sudah terdefinisi di scope Anda
             'Content-Type': 'application/json'
         },
         body: JSON.stringify(bodyData)
     });
     
     if (response.ok) {
         Swal.fire('Terhapus!', 'Data pengguna berhasil dihapus.', 'success');
         if (typeof fetchAndUpdateData === 'function') fetchAndUpdateData();
     } else {
         throw new Error(`Server status ${response.status}`);
     }
  } catch(e) {
      console.error('Error saat handleDelete:', e);
      Swal.fire('Oops...', 'Gagal menghapus data pengguna.', 'error');
  }
}