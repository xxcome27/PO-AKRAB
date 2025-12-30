// ===============================
// GLOBAL
// ===============================
let basePrice = 0;
let uniqueCode = 0;
let productName = '';

// ===============================
// FUNGSI DISABLE TOMBOL
// ===============================
function toggleAllButtons(state){
  document.querySelectorAll('.pay-btn').forEach(btn => {
    btn.disabled = !state.checked;
  });
}

// ===============================
// PEMBAYARAN
// ===============================
function openPayment(price, product){
  basePrice = price;
  productName = product;
  uniqueCode = Math.floor(10 + Math.random() * 90); // 2 digit

  const total = basePrice + uniqueCode;

  document.getElementById('hargaProduk').innerText =
    basePrice.toLocaleString('id-ID');

  document.getElementById('kodeUnik').innerText = uniqueCode;

  document.getElementById('totalBayar').innerText =
    'Rp ' + total.toLocaleString('id-ID');

  document.getElementById('paymentModal').style.display = 'flex';
}

function closeModal(){
  document.getElementById('paymentModal').style.display = 'none';
}

function copyNominal(){
  const total = basePrice + uniqueCode;
  navigator.clipboard.writeText(total.toString());
  alert('Nominal pembayaran disalin: ' + total);
}

function sendWA(){
  const total = basePrice + uniqueCode;
  const text =
    `PRE-ORDER AKRAB\n` +
    `Produk: ${productName}\n` +
    `Harga: Rp ${basePrice}\n` +
    `Kode Unik: Rp ${uniqueCode}\n` +
    `Total Bayar: Rp ${total}\n` +
    `Metode: QRIS`;

  const phone = '628XXXXXXXXXX';
  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
    '_blank'
  );
}

// ===============================
// COUNTDOWN PO (WIB FIX)
// ===============================
const poSessions = [
  { start: '11:00', end: '15:00', label: 'PO 2' },
  { start: '17:00', end: '21:00', label: 'PO 1' }
];

function getWIBDate(){
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60000);
}

function timeToMinutes(time){
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatCountdown(ms){
  if (ms <= 0) return '0j 0m 0d';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}j ${m}m ${sec}d`;
}

function updatePOSchedule(){
  const now = getWIBDate();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const checkbox = document.getElementById('agreeGlobal');
  const status = document.getElementById('poStatus');

  let active = null;
  let next = null;

  for (let session of poSessions){
    const start = timeToMinutes(session.start);
    const end = timeToMinutes(session.end);

    if (nowMin >= start && nowMin < end){
      active = session;
      break;
    }

    if (!next && nowMin < start){
      next = session;
    }
  }

  // =====================
  // 🟢 PO BUKA
  // =====================
  if (active){
    checkbox.disabled = false;
    status.innerText = `🟢 ${active.label} sedang dibuka (WIB)`;
    return;
  }

  // =====================
  // 🔒 PO TUTUP
  // =====================
  checkbox.checked = false;
  checkbox.disabled = true;
  toggleAllButtons({ checked:false });

  if (!next){
    next = poSessions[0];
    now.setDate(now.getDate() + 1);
  }

  const [h, m] = next.start.split(':');
  const nextTime = new Date(now);
  nextTime.setHours(h, m, 0, 0);

  const diff = nextTime - getWIBDate();

  status.innerText =
    `⏳ PO dibuka lagi dalam ${formatCountdown(diff)} (WIB)`;
}

// ===============================
// JALANKAN REALTIME
// ===============================
setInterval(updatePOSchedule, 1000);
updatePOSchedule();