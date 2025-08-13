// Dark mode preference
const root = document.documentElement;
const savedTheme = localStorage.getItem('kolibri-theme');
if (savedTheme === 'dark') root.classList.add('dark');

function toggleTheme(){
  root.classList.toggle('dark');
  localStorage.setItem('kolibri-theme', root.classList.contains('dark') ? 'dark' : 'light');
}

// Sample data (you can extend)
const DATA = {
  "Soğuk İçecekler": [
    { name: "Ice Latte", price: 75, img: "images/cold_drinks/ıcelatte.png", tags:["Kahve","Sütlü"] },
    { name: "Limonata", price: 60, img: "images/cold_drinks/limonata.png", tags:["Ferah","Ev Yapımı"] },
    { name: "Ice Tea Şeftali", price: 55, img: "assets/placeholder.svg", tags:["Demleme"] },
    { name: "Cold Brew", price: 80, img: "assets/placeholder.svg", tags:["Yoğun"] },
    { name: "Karpuz Smoothie", price: 68, img: "assets/placeholder.svg", tags:["Ferahlatıcı"] }, 
    { name: "Mango Smoothie", price: 70, img: "assets/placeholder.svg", tags:["Tropikal"] }  
  ],
  "Sıcak İçecekler": [
    { name: "Espresso", price: 55, img: "assets/placeholder.svg", tags:["Tek Shot"] },
    { name: "Cappuccino", price: 75, img: "images/hot_drinks/cappucino.png", tags:["Köpüklü"] },
    { name: "Latte", price: 70, img: "assets/placeholder.svg", tags:["Sütlü"] },
    { name: "Türk Kahvesi", price: 60, img: "assets/placeholder.svg", tags:["Klasik"] },
    { name: "Çay", price: 60, img: "assets/placeholder.svg", tags:["Klasik"] }
  ],
  "Tatlılar": [
    { name: "Tiramisu", price: 95, img: "images/sweets/Tiramisu.png", tags:["Kakao"] },
    { name: "San Sebastian", price: 110, img: "assets/placeholder.svg", tags:["Cheesecake"] },
    { name: "Çikolatalı Sufle", price: 100, img: "images/sweets/cikolatalı_sufle.png", tags:["Sıcak"] },
    { name: "Profiterol", price: 90, img: "assets/placeholder.svg", tags:["Krema"] },
    { name: "Trileçe", price: 120, img: "images/sweets/Trileçe.png", tags:["Karamel"] }
  ],
  "Atıştırmalıklar": [
    { name: "Tost (Kaşarlı)", price: 85, img: "images/snacks/kasarlı_tost.png", tags:["Vejetaryen"] },
    { name: "Avokadolu Sandviç", price: 120, img: "assets/placeholder.svg", tags:["Fit"] },
    { name: "Patates Kızartması", price: 70, img: "assets/placeholder.svg", tags:["Paylaşım"] }
  ]
};

const CATEGORY_IMAGES = {
  "Soğuk İçecekler": "images/category/sogukicecekler.png",
  "Sıcak İçecekler": "images/category/sicakicecekler.png",
  "Tatlılar": "images/category/tatlılar.png",
  "Atıştırmalıklar": "images/category/atıstırmalıklar.png"
};

function openCategory(cat){
  currentCategory = cat;
  window.scrollTo({top:0, behavior:'smooth'}); // mobilde üstte açılması için
  document.querySelector('#home').style.display = 'none';
  productsView.style.display = 'block';
  breadcrumbEl.innerHTML = `<a href="#" id="crumb-home">Ana Sayfa</a> / <span>${cat}</span>`;
  document.querySelector('#crumb-home').addEventListener('click', (e)=>{
    e.preventDefault();
    backHome();
  });
  searchInput.value='';
  renderProducts(cat);
}

// Ürün render fonksiyonu responsive grid ile zaten uyumlu
function renderProducts(cat){
  const q = searchInput.value.trim().toLowerCase();
  const items = (DATA[cat]||[]).filter(x => x.name.toLowerCase().includes(q) || x.tags.join(' ').toLowerCase().includes(q));
  productGrid.innerHTML = '';
  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card fade-enter';
    card.innerHTML = `
      <div class="cover">
        <img src="${p.img}" alt="${p.name}" loading="lazy"/>
        <span class="badge">${formatPrice(p.price)}</span>
      </div>
      <div class="body">
        <h3 class="name">${p.name}</h3>
        <p class="price">Fiyat: ${formatPrice(p.price)}</p>
        <div class="tags">${p.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}</div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

const categoriesEl = document.querySelector('#categories');
const productsView = document.querySelector('#products-view');
const productGrid = document.querySelector('#product-grid');
const breadcrumbEl = document.querySelector('#breadcrumb');
const searchInput = document.querySelector('#search');

function formatPrice(tl){ 
  return new Intl.NumberFormat('tr-TR', {style:'currency', currency:'TRY', maximumFractionDigits:0}).format(tl); 
}

function renderCategories(){
  categoriesEl.innerHTML = '';
  Object.keys(DATA).forEach(cat => {
    const count = DATA[cat].length;
    const el = document.createElement('div');
    el.className = 'category fade-enter';
    el.innerHTML = `
      <div class="cat-image"><img src="${CATEGORY_IMAGES[cat]}" alt="${cat}" loading="lazy"></div>
      <div class="cat-chip">${count}</div>
      <div class="cat-name">${cat}</div>
      <div class="cat-note">Sizin için seçtiklerimiz</div>
    `;
    el.addEventListener('click', ()=> openCategory(cat));
    categoriesEl.appendChild(el);
  });
}

let currentCategory = null;
function openCategory(cat){
  currentCategory = cat;
  window.scrollTo({top:0, behavior:'smooth'});
  document.querySelector('#home').style.display = 'none';
  productsView.style.display = 'block';
  breadcrumbEl.innerHTML = `<a href="#" id="crumb-home">Ana Sayfa</a> / <span>${cat}</span>`;
  document.querySelector('#crumb-home').addEventListener('click', (e)=>{
    e.preventDefault();
    backHome();
  });
  searchInput.value='';
  renderProducts(cat); // Dinamik olarak güncel ürünleri render et
}

function backHome(){
  productsView.style.display = 'none';
  document.querySelector('#home').style.display = 'block';
  currentCategory = null;
}

function renderProducts(cat){
  const q = searchInput.value.trim().toLowerCase();
  const items = (DATA[cat]||[]).filter(x => x.name.toLowerCase().includes(q) || x.tags.join(' ').toLowerCase().includes(q));

  productGrid.innerHTML = '';
  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card fade-enter';
    card.innerHTML = `
      <div class="cover">
        <img src="${p.img}" alt="${p.name}" loading="lazy"/>
        <span class="badge">${formatPrice(p.price)}</span>
      </div>
      <div class="body">
        <h3 class="name">${p.name}</h3>
        <p class="price">Fiyat: ${formatPrice(p.price)}</p>
        <div class="tags">${p.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}</div>
      </div>
    `;
    productGrid.appendChild(card);
  });

  if(items.length === 0){
    const empty = document.createElement('div');
    empty.style.opacity = .7;
    empty.textContent = 'Sonuç bulunamadı.';
    productGrid.appendChild(empty);
  }
}

// Theme toggle ve search input
document.querySelector('#toggle-theme').addEventListener('click', toggleTheme);
searchInput.addEventListener('input', ()=>{ if(currentCategory) renderProducts(currentCategory); });

// Sayfa açılışı
renderCategories();
