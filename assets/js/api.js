const isLocalhost = [
  "localhost",
  "127.0.0.1",
  "msi-order-system.vercel.app",
].includes(window.location.hostname);

const mode = isLocalhost ? "development" : "production";
const baseUrl =
  mode === "production"
    ? "https://prod.masterkuliner.cloud" //production
    : "https://devngomset.katib.cloud"; //development
const API_TOKEN =
  "3ed66de3108ce387e9d134c419c0fdd61687c3b06760419d32493b18366999d2";

const API_KEY = "yTigmA0W7a9e30666d9434a0JlGNkxwv";
const BASE_URL = "https://rajaongkir.komerce.id/api/v1/destination";
const options = {
  mode: "no-cors",
  method: "GET",
  headers: { accept: "application/json", key: API_KEY },
};

let urlapi = null;
let currentDataSearch = "";
let currentFilterPIC = null;
let currentFilterStatus = null;
let currentFilterType = null;
let currentPeriod = "weekly";
let chartType = "bar";
let bundlingItems = [];

function modedev() {
  const devModeElement = document.getElementById("devmode");
  if (mode === "development") {
    devModeElement.classList.remove("hidden");
    devModeElement.textContent = `<dev> ${mode} Mode URL: ${baseUrl}</dev>`;
  }
}

const defaultState = {
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  isSubmitting: false,
  loading: false,
  data: [],
  error: null,
};

function modedev() {
  const devModeElement = document.getElementById("devmode");
  if (mode === "development") {
    devModeElement.classList.remove("hidden");
    devModeElement.textContent = "<dev> Development Mode </dev>";
  }
}

const endpointList = [
  "user",
  "sales",
  "sales_unpaid",
  "sales_receipt",
  "sales_package",
  "package_slip",
  "sales_shipment",
  "shipment_slip",
  "shipment_label",
  "product",
  "product_bundling",
  "client",
  "business_category",
  "employee",
  "product_unit",
  "product_status",
  "werehouse",
  "werehouse_pic",
  "finance_account_payment",
  "product_category",
  "level",
];

// generate state otomatis
const state = endpointList.reduce((acc, type) => {
  acc[type] = { ...defaultState };
  return acc;
}, {});

// generate endpoints otomatis
const endpoints = endpointList.reduce((acc, type) => {
  acc[type] = {
    table: `${baseUrl}/table/${type}/${owner_id}`,
    list: `${baseUrl}/list/${type}/${owner_id}`,
    detail: `${baseUrl}/detail/${type}`,
    update: `${baseUrl}/update/${type}`,
    create: `${baseUrl}/add/${type}`,
    delete: `${baseUrl}/delete/${type}`,
  };
  return acc;
}, {});

async function checkApiStatus() {
  //   console.log('Pengecekan Koneksi...');
  const statusEl = document.getElementById("apiIndicator");
  const textEl = document.getElementById("apiIndicatorText");
  try {
    const res = await fetch(`${baseUrl}/detail/user/${user_id}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const data = await res.json();

    if (res.ok && data.detail && data.detail.status_active === "Active") {
      statusEl.textContent = "🟢";
      textEl.textContent = "🟢 API Connection OK";
      statusEl.classList.remove("text-red-600");
      statusEl.classList.add("text-green-600");

      // Simpan ke localStorage dengan expired time (1 jam)
      const expiredTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 7 hari
      const userDetailWithExpiry = {
        value: data.detail,
        expiry: expiredTime,
      };
      localStorage.setItem("user_detail", JSON.stringify(userDetailWithExpiry));
      const user_detail = JSON.parse(
        localStorage.getItem("user_detail") || "{}"
      );
      const welcomeMessageSpan = document.getElementById("nameUser");
      welcomeMessageSpan.textContent = `Hi, ${user_detail.value.name} 👋`;
    } else {
      statusEl.textContent = "🔴";
      textEl.style.whiteSpace = "pre-line";
      textEl.textContent = "🟢 API Connection OK,\n🔴 User Not Active";
      statusEl.classList.remove("text-green-600");
      statusEl.classList.add("text-red-600");
    }
  } catch (err) {
    console.error("Gagal konek ke API:", err);
    statusEl.textContent = "❌";
    textEl.textContent = "❌ API Connection Failed";
    statusEl.classList.remove("text-green-600");
    statusEl.classList.add("text-red-600");
  }
}

async function fetchData(type, page = 1, id = null, filter = null) {
  try {
    let url;

    // ----- LOGIKA URL (Sudah Benar) -----
    if (type === "werehouse_pic" && id !== null) {
      url = `${baseUrl}/table/werehouse_pic/${id}/${page}?search=${currentDataSearch}`;
    } else if (type === "vendor_contact" && id !== null) {
      url = `${baseUrl}/table/vendor_contact/${id}/${page}?search=${currentDataSearch}`;
    } else if (id !== null) {
      url = `${endpoints[type].table}/${id}/${page}?search=${currentDataSearch}`;
    } else {
      url = `${endpoints[type].table}/${page}?search=${currentDataSearch}`;
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });

    console.log("Fetch URL=", url);
    urlapi = url;

    if (!response.ok) throw new Error("Network response was not ok");

    // Ambil data JSON
    let result = await response.json();

    // ===============================================
    // 🔥 FIX FORCE: MAPPING & HITUNG ULANG TOTAL 🔥
    // ===============================================

    // Cek jika API mengirim listData
    if (result.listData) {
      // 1. Pindahkan ke tableData agar terbaca sistem
      result.tableData = result.listData;

      // 2. [PENTING] HAPUS logic "if (!result.totalRecords)"
      // Kita PAKSA totalRecords mengikuti jumlah data yang ada di array
      // Ini memperbaiki masalah dimana API bilang cuma ada 1 data, padahal arraynya banyak.
      result.totalRecords = result.listData.length;
      result.totalPages = 1;

      console.log(
        `Fix Applied: Found ${result.listData.length} items, forcing totalRecords to ${result.totalRecords}`
      );
    }
    // ===============================================

    return result;
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    return { tableData: [], totalRecords: 0, totalPages: 0 };
  }
}

async function fetchList(type) {
  try {
    const url = `${endpoints[type].list}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });

    if (!response.ok)
      throw new Error(`Failed to fetch ${type} data: ${response.statusText}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error fetching ${type} list:`, error);
    return [];
  }
}

async function fetchById(type, id) {
  try {
    const response = await fetch(`${endpoints[type].detail}/${id}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} by ID:`, error);
    return null;
  }
}

async function updateData(type, id, payload) {
  try {
    const response = await fetch(`${endpoints[type].update}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error(`Error updating ${type} data:`, error);
    return null;
  }
}

async function createData(type, payload) {
  try {
    const body = JSON.stringify({ owner_id, ...payload });
    const response = await fetch(`${endpoints[type].create}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    return null;
  }
}

async function createDataWithFile(type, payload) {
  try {
    const formDataFile = new FormData();

    // Append all payload fields to FormData
    for (const key in payload) {
      formDataFile.append(key, payload[key]);
    }

    // Append owner_id separately if needed
    if (owner_id) {
      formDataFile.append("owner_id", owner_id);
    }

    const response = await fetch(`${endpoints[type].create}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        // **DO NOT** manually set `Content-Type`, the browser will handle it automatically
      },
      body: formDataFile,
    });

    if (!response.ok) throw new Error("Network response was not ok");

    return await response.json();
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    return null;
  }
}

async function deleteData(type, id) {
  try {
    const response = await fetch(`${endpoints[type].delete}/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    return null;
  }
}
