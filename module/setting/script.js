  function switchTab(tabId) {
    document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active-tab', 'bg-blue-100', 'text-blue-600', 'font-semibold'));
    document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('active-tab', 'bg-blue-100', 'text-blue-600', 'font-semibold');

    document.querySelectorAll('.setting-content').forEach(div => div.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
  }