    const ctxSales = document.getElementById('salesTrendChart');
    new Chart(ctxSales, {
      type: 'line',
      data: {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [{
          label: 'Revenue',
          data: [12000000, 15000000, 11000000, 19000000, 24000000, 21000000, 18000000],
          borderColor: 'rgb(37, 99, 235)',
          tension: 0.3,
          fill: false
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const ctxStatus = document.getElementById('orderStatusChart');
    new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Menunggu', 'Verifikasi', 'Sebagian', 'Selesai'],
        datasets: [{
          data: [9, 0, 0, 1100],
          backgroundColor: ['#fb923c', '#facc15', '#38bdf8', '#22c55e']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });