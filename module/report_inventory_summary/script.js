  // Trend Chart
    const ctxTrend = document.getElementById('inventoryTrendChart');
    new Chart(ctxTrend, {
      type: 'bar',
      data: {
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
        datasets: [
          {
            label: 'Stok Masuk',
            data: [3000, 3200, 2900, 3440],
            backgroundColor: '#22c55e'
          },
          {
            label: 'Stok Keluar',
            data: [2600, 3100, 2700, 3720],
            backgroundColor: '#ef4444'
          }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Stock Composition
    const ctxCategory = document.getElementById('stockCategoryChart');
    new Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels: ['Bahan Baku', 'Produk Jadi', 'Peralatan'],
        datasets: [{
          data: [45, 35, 20],
          backgroundColor: ['#60a5fa', '#a78bfa', '#fbbf24']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });