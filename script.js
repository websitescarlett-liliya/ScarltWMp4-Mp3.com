let level = 1;
let isPremium = localStorage.getItem('isPremium') === 'true';
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let downloads = JSON.parse(localStorage.getItem('downloads') || '{"video":[],"audio":[]}');
let koleksi = JSON.parse(localStorage.getItem('koleksi') || '[]');

// Naik level tiap 5 detik
setInterval(()=>{
  level++;
  document.getElementById('level').innerText = level;
},5000);

// Load data saat buka
window.onload = ()=>{
  if(isPremium){
    document.getElementById('proBadge').innerText = 'PRO';
    document.getElementById('btnKoleksi').classList.remove('hidden');
  }
  renderGallery();
  renderFav();
  renderKoleksi();
}

// Ganti halaman
function showPage(page){
  document.querySelectorAll('.content').forEach(c=>c.classList.add('hidden'));
  document.getElementById('page-'+page).classList.remove('hidden');
}

// Toggle tema
function toggleTheme(){ document.body.classList.toggle('light'); }

// Custom background
document.getElementById('bgUpload').onchange = e=>{
  const file = e.target.files[0];
  const url = URL.createObjectURL(file);
  document.documentElement.style.setProperty('--bg-img', `url(${url})`);
}

// Search + Download pake API tikwm.com
async function doSearch(){
  const q = document.getElementById('searchInput').value;
  if(!q) return alert('Masukkan link TikTok atau kata kunci');

  const gallery = document.getElementById('resultGallery');
  gallery.innerHTML = '<p>Loading...</p>';

  // Kalau yang dimasukkan link tiktok
  if(q.includes('tiktok.com')){
    try {
      const res = await fetch(`https://api.tikwm.com/video/?url=${encodeURIComponent(q)}`);
      const data = await res.json();

      if(data.code!== 0) throw new Error(data.msg);

      const video = data.data;
      gallery.innerHTML = `
        <div class="card">
          <img src="${video.cover}" style="width:100%;border-radius:8px">
          <p><b>${video.title}</b></p>
          <p>@${video.author.nickname}</p>
          <button onclick="downloadFile('${video.play}','video','${video.title}')">Download MP4</button>
          <button onclick="downloadFile('${video.music}','audio','${video.title}')">Download MP3</button>
          <button onclick="addFav('${video.title}')">⭐ Favorite</button>
        </div>
      `;
    } catch(err){
      gallery.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  } else {
    // Kalau yang dimasukkan kata kunci, kita kasih contoh aja
    gallery.innerHTML = `<div class="card"><p>Hasil pencarian untuk: ${q}</p><p>API tikwm butuh link langsung. Tempel link tiktoknya ya</p></div>`;
  }
}

// Fungsi download file
function downloadFile(url, type, name){
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.${type === 'video'? 'mp4' : 'mp3'}`;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Masukkan ke galeri
  addDownload(type, name);
}

// Tambah download ke galeri
function addDownload(type,name){
  downloads[type].push(name);
  localStorage.setItem('downloads', JSON.stringify(downloads));
  renderGallery();
}

// Tambah favorite
function addFav(name){
  if(!favorites.includes(name)) favorites.push(name);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderFav();
}

function renderGallery(){
  document.getElementById('gallery-video').innerHTML = downloads.video.map(v=>`<div class="card">${v}</div>`).join('') || '<p>Belum ada video</p>';
  document.getElementById('gallery-audio').innerHTML = downloads.audio.map(a=>`<div class="card">${a}</div>`).join('') || '<p>Belum ada audio</p>';
}
function renderFav(){
  document.getElementById('gallery-fav').innerHTML = favorites.map(f=>`<div class="card">${f}</div>`).join('') || '<p>Belum ada favorite</p>';
  document.getElementById('favCount').innerText = favorites.length;
  document.getElementById('badgeFav').innerText = favorites.length;
}

// Koleksi Premium
function checkPremium(){
  if(!isPremium) return alert('Aktifkan Premium dulu di menu Profile > titik 3');
  showPage('gallery'); showTab('koleksi');
}
function openPremiumModal(){ document.getElementById('premiumModal').classList.remove('hidden'); }
function closePremiumModal(){ document.getElementById('premiumModal').classList.add('hidden'); }
function activatePremium(){
  const token = document.getElementById('tokenInput').value;
  if(token === 'Ryuka5522'){
    isPremium = true;
    localStorage.setItem('isPremium', 'true');
    document.getElementById('proBadge').innerText = 'PRO';
    document.getElementById('btnKoleksi').classList.remove('hidden');
    alert('Premium Aktif!');
    closePremiumModal();
  } else { alert('Token salah!'); }
}

// Upload foto ke koleksi
document.getElementById('fotoUpload').onchange = e=>{
  const file = e.target.files[0];
  const url = URL.createObjectURL(file);
  koleksi.push(url);
  localStorage.setItem('koleksi', JSON.stringify(koleksi));
  renderKoleksi();
}
function renderKoleksi(){
  document.getElementById('gallery-koleksi').innerHTML =
  `<div class="card add-card" onclick="document.getElementById('fotoUpload').click()">+ Tambah Foto</div>` +
  koleksi.map(k=>`<div class="card"><img src="${k}" style="width:100%;border-radius:8px"></div>`).join('');
}

function showTab(tab){
  ['video','audio','koleksi'].forEach(t=>document.getElementById('gallery-'+t).classList.add('hidden'));
  document.getElementById('gallery-'+tab).classList.remove('hidden');
}