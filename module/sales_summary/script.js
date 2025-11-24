
    // Data JSON sementara (bisa diganti nanti dengan fetch dari API)
     dataDashboard = {
      bulanan: [100, 250, 200, 400, 350, 300, 450, 280, 420, 380, 320],
      pelanggan: {
        labels: ["Pelanggan A", "Pelanggan B", "Pelanggan C", "Pelanggan D", "Pelanggan E"],
        values: [300, 220, 180, 140, 100]
      },
      paket: {
        labels: ["Paket A", "Paket B", "Paket C", "Paket D"],
        values: [40, 35, 15, 10]
      },
      tipe: [
        { nama: "Reguler", jumlah: 1150 },
        { nama: "Promo", jumlah: 800 },
        { nama: "Grosir", jumlah: 600 },
        { nama: "Lainnya", jumlah: 300 }
      ],
      packer: [
        { nama: "Packer 1", jumlah: 1000 },
        { nama: "Packer 2", jumlah: 900 },
        { nama: "Packer 3", jumlah: 700 }
      ],
      kurir: [
        { nama: "Kurir A", jumlah: 1200 },
        { nama: "Kurir B", jumlah: 950 },
        { nama: "Kurir C", jumlah: 780 }
      ]
    };

    // Chart: Penjualan Bulanan
    new Chart(document.getElementById("chartBulanan"), {
      type: "line",
      data: {
        labels: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov"],
        datasets: [{
          label: "Penjualan",
          data: dataDashboard.bulanan,
          borderColor: "#3b82f6",
          fill: true,
          backgroundColor: "rgba(59,130,246,0.1)"
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Chart: Penjualan per Pelanggan
    new Chart(document.getElementById("chartPelanggan"), {
      type: "bar",
      data: {
        labels: dataDashboard.pelanggan.labels,
        datasets: [{
          label: "Jumlah",
          data: dataDashboard.pelanggan.values,
          backgroundColor: "#60a5fa"
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Chart: Penjualan per Paket
    new Chart(document.getElementById("chartPaket"), {
      type: "pie",
      data: {
        labels: dataDashboard.paket.labels,
        datasets: [{
          data: dataDashboard.paket.values,
          backgroundColor: ["#3b82f6", "#60a5fa", "#93c5fd", "#a7f3d0"]
        }]
      },
      options: { responsive: true }
    });

    // Tabel: Penjualan per Tipe
    document.getElementById("tableTipe").innerHTML = dataDashboard.tipe
      .map(t => `<tr><td class="py-1">${t.nama}</td><td class="py-1 text-right">${t.jumlah}</td></tr>`).join("");

    // Tabel: Packer
    document.getElementById("tablePacker").innerHTML = dataDashboard.packer
      .map(p => `<tr><td class="py-1">${p.nama}</td><td class="py-1 text-right">${p.jumlah}</td></tr>`).join("");

    // Tabel: Kurir
    document.getElementById("tableKurir").innerHTML = dataDashboard.kurir
      .map(k => `<tr><td class="py-1">${k.nama}</td><td class="py-1 text-right">${k.jumlah}</td></tr>`).join("");

