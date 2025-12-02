pagemoduleparent = "sales";
loadDetailSales(detail_id);

async function loadDetailSales(Id) {
  window.detail_id = Id;

  fetch(`${baseUrl}/detail/sales_package/${Id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  })
    .then((res) => res.json())
    .then(({ detail }) => {
      return loadProdukList(detail.customer_id).then(() => detail);
    })
    .then((detail) => {
      document.getElementById("formTitle").innerText = `UPDATE PACKING LIST`;
      document.getElementById("tanggal").value = detail.date;
      document.getElementById("pelanggan").value = detail.nama;
      document.getElementById("no_package").value = detail.no_package;
      document.getElementById("no_inv").value = detail.no_inv;
      document.getElementById("notes").value = detail.notes;
      document.getElementById("pic_name").value = detail.pic_name;
      document.getElementById("totalBerat").innerText = `${
        detail.total_weight?.toLocaleString("id-ID") || 0
      } gram`;
      document.getElementById("totalItem").innerText = `${
        detail.total_qty?.toLocaleString("id-ID") || 0
      } item`;
      document.getElementById("totalPackage").innerText = `${
        detail.total_package || 0
      }`;

      const tbody = document.getElementById("tabelItem");
      tbody.innerHTML = "";

      detail.items.forEach((item) => {
        tambahItem();
        const row = tbody.lastElementChild;

        row.querySelector(".searchProduk").value = item.item_name;
        row.querySelector(".itemNama").value = item.product_id;
        row.querySelector(".itemCat").innerText = item.category;

        // Set value Pengepakan awal
        const pkgInput = row.querySelector(".itemPackage");
        pkgInput.value = item.package_group || "";

        // --- PERUBAHAN DI SINI ---
        if (item.category === "Kemitraan") {
          // 1. Disable search produk (karena bundling)
          row.querySelector(".searchProduk").disabled = true;

          // 2. Sembunyikan Input Qty
          const qtyInput = row.querySelector(".itemQty");
          qtyInput.value = ""; // Kosongkan value
          qtyInput.classList.add("hidden"); // Sembunyikan element

          // 3. Kosongkan Teks Berat
          const beratTxt = row.querySelector(".itemBerat");
          beratTxt.innerText = ""; // Kosongkan teks

          // 4. Sembunyikan Input Pengepakan
          pkgInput.value = ""; // Kosongkan value
          pkgInput.classList.add("hidden"); // Sembunyikan element
        } else {
          // Jika BUKAN Kemitraan, tampilkan normal
          const qtyInput = row.querySelector(".itemQty");
          qtyInput.value = item.qty;
          qtyInput.disabled = false;
          qtyInput.classList.remove("hidden");

          const beratTxt = row.querySelector(".itemBerat");
          beratTxt.innerText = item.weight?.toLocaleString("id-ID") || "0";

          pkgInput.classList.remove("hidden");
        }
        // -------------------------

        const select = row.querySelector(".itemNama");
        const match = Array.from(select.options).find(
          (o) => o.value == item.product_id
        );
        if (match) select.value = match.value;

        if (Array.isArray(item.item_detail)) {
          item.item_detail.forEach((sub) => {
            tambahSubItem(row.querySelector("button"));
            const subRow = row.nextElementSibling;

            subRow.querySelector(".searchProduk").value = sub.item_name;
            subRow.querySelector(".itemNama").value = sub.item_id;
            subRow.querySelector(".itemCat").innerText = "Item Kemitraan";
            subRow.querySelector(".itemQty").value = sub.qty;
            subRow.querySelector(".itemBerat").innerText =
              sub.weight?.toLocaleString("id-ID") || 0;

            subRow.querySelector(".itemPackage").value =
              sub.package_group || "";

            const subSelect = subRow.querySelector(".itemNama");
            const subMatch = Array.from(subSelect.options).find(
              (o) => o.value == sub.product_id
            );
            if (subMatch) subSelect.value = subMatch.value;
            document
              .getElementById("btnTambahSubItem")
              .classList.remove("hidden");
          });
        }
      });

      recalculateTotal();
    })
    .catch((err) => console.error("Gagal load detail:", err));
}

async function updatePackinglist() {
  try {
    const konfirmasi = await Swal.fire({
      title: "Update Data?",
      text: "Apakah kamu yakin ingin menyimpan perubahan invoice ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✅ Ya, simpan",
      cancelButtonText: "❌ Batal",
    });

    if (!konfirmasi.isConfirmed) return;

    const rows = Array.from(document.querySelectorAll("#tabelItem tr"));
    const pic = document.getElementById("pic_name").value;
    const sales_package_detail = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cat = row.querySelector(".itemCat")?.innerHTML || "";

      if (row.classList.contains("sub-item-row")) continue;

      const mainItem = {
        product_id: parseInt(row.querySelector(".itemNama")?.value || 0),
        qty:
          cat === "Kemitraan"
            ? 1
            : parseInt(row.querySelector(".itemQty")?.value || 0),
        // TAMBAHAN: Ambil value package_group main item
        package_group: row.querySelector(".itemPackage")?.value || "",
      };

      const item_detail = [];

      while (
        i + 1 < rows.length &&
        rows[i + 1].classList.contains("sub-item-row")
      ) {
        const subRow = rows[i + 1];

        const sub = {
          item_id: parseInt(subRow.querySelector(".itemNama")?.value || 0),
          qty: parseInt(subRow.querySelector(".itemQty")?.value || 0),
          // TAMBAHAN: Ambil value package_group sub item
          package_group: subRow.querySelector(".itemPackage")?.value || "",
        };

        item_detail.push(sub);
        i++;
      }

      // Selalu kirim array item_detail meskipun kosong (sesuai struktur payload contoh)
      // Atau gunakan if (item_detail.length > 0) sesuai kebutuhan backend
      if (item_detail.length > 0) {
        mainItem.item_detail = item_detail;
      } else {
        // Opsional: jika backend mengharuskan array kosong utk item biasa
        mainItem.item_detail = [];
      }

      sales_package_detail.push(mainItem);
    }

    const body = {
      owner_id: owner_id, // Pastikan variabel global ini tersedia
      user_id: user_id, // Pastikan variabel global ini tersedia
      pic_name: pic,
      sales_package_detail,
    };

    console.log("PAYLOAD:", JSON.stringify(body, null, 2));

    const res = await fetch(
      `${baseUrl}/update/sales_package/${window.detail_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(body),
      }
    );

    const json = await res.json();

    if (res.ok) {
      Swal.fire(
        "Sukses",
        "✅ Data packing list berhasil diperbarui.",
        "success"
      );
      loadModuleContent("package");
    } else {
      Swal.fire(
        "Gagal",
        json.message || "❌ Gagal update packing list.",
        "error"
      );
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "❌ Terjadi kesalahan saat memproses.", "error");
  }
}

async function loadProdukList(customer_id) {
  const res = await fetch(`${baseUrl}/list/product_sales/${customer_id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  const json = await res.json();
  produkList = json.listData || [];
}

function tambahItem() {
  const tbody = document.getElementById("tabelItem");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="px-3 py-2 border">
      <input type="text" placeholder="Cari Produk..." class="w-full border rounded px-2 mb-1 searchProduk" oninput="filterProdukDropdownCustom(this)" />
      <div class="produkDropdown hidden border bg-white shadow rounded max-h-40 overflow-y-auto z-50 absolute w-48"></div>
      <select class="itemNama hidden">
        ${produkList
          .map(
            (p) =>
              `<option value="${p.product_id}" data-harga="${p.sale_price}" data-nama="${p.product}">${p.product}</option>`
          )
          .join("")}
      </select>
    </td>
    <td class="px-3 py-2 border itemCat"></td>
    <td class="px-3 py-2 border text-right"><input type="number" class="w-full border rounded px-2 text-right itemQty" value="1" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right itemBerat">0</td>
    
    <td class="px-3 py-2 border">
        <input type="text" class="w-full border rounded px-2 itemPackage" placeholder="Koli..." />
    </td>

    <td class="px-3 py-2 border text-center">
      <button onclick="this.closest('tr').remove(); recalculateTotal();" class="text-red-500 hover:underline">🗑️</button>
      <button onclick="tambahSubItem(this)" id="btnTambahSubItem" class="hidden text-blue-500 hover:underline ml-2">➕</button>
    </td>
  `;
  tbody.appendChild(row);
}

function tambahSubItem(button) {
  const parentRow = button.closest("tr");
  const newRow = document.createElement("tr");
  newRow.classList.add("sub-item-row");

  newRow.innerHTML = `
    <td class="px-3 py-2 border pl-6">
      <input type="text" placeholder="Sub Item..." class="w-full border rounded px-2 mb-1 searchProduk" oninput="filterProdukDropdownCustom(this)" />
      <div class="produkDropdown hidden border bg-white shadow rounded max-h-40 overflow-y-auto z-50 absolute w-48"></div>
      <select class="itemNama hidden">
        ${produkList
          .map(
            (p) =>
              `<option value="${p.product_id}" data-harga="${p.sale_price}" data-nama="${p.product}">${p.product}</option>`
          )
          .join("")}
      </select>
    </td>
    <td class="px-3 py-2 border itemCat">Item Kemitraan</td>
    <td class="px-3 py-2 border text-right"><input type="number" class="w-full border rounded px-2 text-right itemQty" value="1" oninput="recalculateTotal()" /></td>
    <td class="px-3 py-2 border text-right itemBerat">0</td>
    
    <td class="px-3 py-2 border">
        <input type="text" class="w-full border rounded px-2 itemPackage" placeholder="Koli..." />
    </td>

    <td class="px-3 py-2 border text-center">
      <button onclick="this.closest('tr').remove(); recalculateTotal();" class="text-red-500 hover:underline">🗑️</button>
    </td>
  `;

  parentRow.insertAdjacentElement("afterend", newRow);
}

function filterProdukDropdownCustom(inputEl) {
  const value = inputEl.value.toLowerCase();
  const dropdown = inputEl.nextElementSibling;
  const select = inputEl.parentElement.querySelector(".itemNama");
  dropdown.innerHTML = "";

  const filtered = produkList.filter((p) =>
    p.product.toLowerCase().includes(value)
  );
  if (filtered.length === 0) return dropdown.classList.add("hidden");

  filtered.forEach((p) => {
    const div = document.createElement("div");
    div.className = "px-3 py-2 hover:bg-gray-200 cursor-pointer text-sm";
    div.textContent = p.product;
    div.onclick = () => {
      inputEl.value = p.product;
      // inputEl.closest("tr").querySelector(".itemHarga").value = p.sale_price.toLocaleString('id-ID');
      const tr = inputEl.closest("tr");
      // tr.querySelector(".itemHarga").value = p.sale_price.toLocaleString('id-ID');
      tr.querySelector(".itemCat").innerText = p.category;
      tr.querySelector(".itemBerat").innerText = p.weight || 0;

      const opt = Array.from(select.options).find(
        (o) => o.value == p.product_id
      );
      if (opt) select.value = opt.value;
      dropdown.classList.add("hidden");
      recalculateTotal();
    };
    dropdown.appendChild(div);
  });

  dropdown.classList.remove("hidden");
}

function recalculateTotal() {
  const rows = document.querySelectorAll("#tabelItem tr");
  let weight = 0;
  let itemqty = 0;
  rows.forEach((row) => {
    const qty = parseFloat(
      row.querySelector(".itemQty")?.value.replace(/[^\d]/g, "") || 0
    );
    const berat = parseFloat(
      row.querySelector(".itemBerat")?.innerText.replace(/[^\d]/g, "") || 0
    );
    weight += qty * berat;
    itemqty += qty;
  });
  document.getElementById("totalBerat").innerText = `${weight.toLocaleString(
    "id-ID"
  )} gr`;
  document.getElementById("totalItem").innerText = `${itemqty.toLocaleString(
    "id-ID"
  )} item`;
}

async function printDocument(invoice_id) {
  try {
    const response = await fetch(`${baseUrl}/detail/sales/${invoice_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const result = await response.json();
    const data = result?.detail;
    if (!data) throw new Error("Data paket tidak ditemukan");

    // Tampilkan pilihan aksi ke user
    const { isConfirmed, dismiss } = await Swal.fire({
      title: "Cetak Faktur Penjualan",
      text: "Pilih metode pencetakan:",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Download PDF",
      cancelButtonText: "Print Langsung",
      reverseButtons: true,
    });

    if (isConfirmed) {
      const url = `faktur_print.html?id=${invoice_id}`;
      // === Download PDF (via packing_print.html di iframe) ===
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
            Swal.fire(
              "Berhasil",
              "Faktur Penjualan berhasil diunduh.",
              "success"
            );
          }, 3000);
        },
      });
    } else if (dismiss === Swal.DismissReason.cancel) {
      // === Print Langsung (open tab) ===
      window.open(`faktur_print.html?id=${invoice_id}`, "_blank");
    }
  } catch (error) {
    Swal.fire({
      title: "Gagal",
      text: error.message,
      icon: "error",
    });
  }
}
