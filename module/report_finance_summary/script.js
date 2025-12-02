    const ctxCashflow = document.getElementById('cashflowChart');
    new Chart(ctxCashflow, {
      type: 'line',
      data: {
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
        datasets: [
          {
            label: 'Pemasukan',
            data: [40000000, 60000000, 55000000, 70000000],
            borderColor: '#22c55e',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Pengeluaran',
            data: [30000000, 45000000, 50000000, 47000000],
            borderColor: '#ef4444',
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Expense Breakdown
    const ctxExpense = document.getElementById('expenseChart');
    new Chart(ctxExpense, {
      type: 'doughnut',
      data: {
        labels: ['Operasional', 'Gaji', 'Marketing', 'Lain-lain'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: ['#f87171', '#facc15', '#60a5fa', '#a78bfa']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });