pagemodule = "product_return";
colSpanCount = 5;
setDataType("product_return_owner"); // Sesuaikan dengan key di state manager Anda
fetchAndUpdateData();

// --- ROW TEMPLATE ---
window.rowTemplate = function (item, index, perPage = 10) {
  const { currentPage } = state[currentDataType];
  // const globalIndex = (currentPage - 1) * perPage + index + 1;

  // Logika Badge Kondisi
  let conditionBadge = "";
  if (item.condition === "good") {
    conditionBadge = `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Baik</span>`;
  } else if (item.condition === "bad") {
    conditionBadge = `<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Rusak</span>`;
  } else {
    conditionBadge = `<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Expired</span>`;
  }

  return `
 <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">

  <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
    <span class="font-medium sm:hidden">Tanggal</span>
    ${item.return_date}
  </td>

  <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Gudang</span>
    ${item.mitra || "-"}
  </td>

  <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Produk</span>
    <div class="font-semibold">${item.product}</div>
  </td>

  <td class="px-6 py-4 text-sm text-center text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Qty</span>
    <span>${finance(item.qty)}</span>
  </td>

  <td class="px-6 py-4 text-sm text-left text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Catatan</span>
    ${item.notes || "-"}
    
  </td>
  <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
    <span class="font-medium sm:hidden">Gudang</span>
    ${item.werehouse_source || "-"}
  </td>



</tr>
`;
};

// Event Listener Tambah
document.getElementById("addButton").addEventListener("click", () => {
  loadModuleContent("retur_form");
});
