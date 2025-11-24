async function loadDashboardSummary(period = 'weekly') {
  const headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    const [resTransactions, resItemsSold, resSales] = await Promise.all([
      fetch(`${baseUrl}/dashboard/total_transactions/${owner_id}?period=${period}`, { headers }),
      fetch(`${baseUrl}/dashboard/total_items_sold/${owner_id}?period=${period}`, { headers }),
      fetch(`${baseUrl}/dashboard/total_sales/${owner_id}?period=${period}`, { headers })
    ]);

    const transactionsData = await resTransactions.json();
    const itemsSoldData = await resItemsSold.json();
    const salesData = await resSales.json();

    // Update UI
    document.getElementById('totalTransactions').textContent =
      transactionsData?.data?.total_transactions?.toLocaleString('id-ID') ?? '0';

    document.getElementById('totalItemsSold').textContent =
      itemsSoldData?.data?.total_items_sold?.toLocaleString('id-ID') ?? '0';

    document.getElementById('totalSales').textContent =
      'Rp ' + (salesData?.data?.total_sales ?? 0).toLocaleString('id-ID');

  } catch (error) {
    console.error('Gagal memuat summary dashboard:', error);
  }
}

async function loadSalesGraph(period = 'weekly') {
  loadDashboardSummary(period);
  loadTopProducts(period); 
  loadTopCustomers(period);
  currentPeriod = period; // simpan state period
  chartType = document.getElementById('chartTypeSelector')?.value || 'bar'; // ambil jenis chart terbaru

  const endpoint = `${baseUrl}/dashboard/sales_overview/${owner_id}?period=${period}`;
  const loader = document.getElementById('chartLoader');
  const chartCanvas = document.getElementById('salesChart');

  try {
    // Tampilkan loader
    loader.classList.remove('hidden');
    chartCanvas.classList.add('opacity-50');

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!result.data.graphData || !Array.isArray(result.data.graphData.data)) {
      throw new Error('Invalid graph data');
    }

    const { data, period: periodLabel, month_label, year } = result.data.graphData;
    const labels = data.map(item => item.date);
    const values = data.map(item => item.sales_count);

    const activeIndex = labels.length - 1;

    const backgroundColors = labels.map((_, i) =>
      i === activeIndex ? 'rgba(30, 0, 255, 0.7)' : 'rgba(75, 192, 192, 0.7)'
    );
    const borderColors = labels.map((_, i) =>
      i === activeIndex ? 'rgba(30, 0, 255, 0.7)' : 'rgb(75, 192, 192)'
    );

    // Hapus chart lama jika ada
    if (window.salesChartInstance) {
      window.salesChartInstance.destroy();
    }

    const ctx = chartCanvas.getContext('2d');
    window.salesChartInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: `Total Penjualan (${periodLabel})`,
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          tension: 0.3, // hanya berpengaruh pada line chart
          pointRadius: chartType === 'line' ? 4 : 0,
          pointBackgroundColor: 'rgb(75, 192, 192)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: period === 'weekly'
              ? `Periode ${month_label ?? '-'} ${year ?? ''}`
              : period === 'monthly'
              ? `Periode Bulan ${month_label ?? '-'} ${year ?? ''}`
              : `Periode Tahun ${year ?? '-'}`
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw || 0;
                return `Penjualan: Rp ${value.toLocaleString('id-ID')}`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'Rp ' + value.toLocaleString('id-ID');
              }
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Gagal load grafik:', error);
  } finally {
    // Sembunyikan loader
    loader.classList.add('hidden');
    chartCanvas.classList.remove('opacity-50');
  }
}

async function loadTopProducts(period = 'weekly') {
  const endpoint = `${baseUrl}/dashboard/top_products/${owner_id}?period=${period}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    const products = result.data || [];

    const container = document.getElementById('topProductsContainer');
    container.innerHTML = '';

    if (products.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm">Tidak ada data produk.</p>';
      return;
    }

    products.forEach((item, index) => {
      const html = `
        <div class="flex justify-between items-center bg-white p-3 rounded-xl shadow text-sm">
          <div class="flex items-center space-x-3">
            <span class="text-gray-500 font-medium">#${index + 1}</span>
            <span class="font-semibold text-gray-800">${item.product}</span>
          </div>
          <span class="text-blue-600 font-semibold">${item.total_sold.toLocaleString('id-ID')} terjual</span>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    });

  } catch (error) {
    console.error('Gagal memuat top produk:', error);
  }
}

async function loadTopCustomers(period = 'weekly') {
  const endpoint = `${baseUrl}/dashboard/top_customers/${owner_id}?period=${period}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    const products = result.data || [];

    const container = document.getElementById('topCustomersContainer');
    container.innerHTML = '';

    if (products.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm">Tidak ada data produk.</p>';
      return;
    }

    products.forEach((item, index) => {
      const html = `
        <div class="flex justify-between items-center bg-white p-3 rounded-xl shadow text-sm">
          <div class="flex items-center space-x-3">
            <span class="text-gray-500 font-medium">#${index + 1}</span>
            <span class="font-semibold text-gray-800">${item.nama}</span>
          </div>
          <span class="text-blue-600 font-semibold">${item.total_transactions.toLocaleString('id-ID')} transaksi</span>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    });

  } catch (error) {
    console.error('Gagal memuat top customer:', error);
  }
}



loadSalesGraph('weekly');

