// Dark mode
const root = document.documentElement;
const savedTheme = localStorage.getItem('kolibri-theme');
if(savedTheme==='dark') root.classList.add('dark');
function toggleTheme(){ root.classList.toggle('dark'); localStorage.setItem('kolibri-theme', root.classList.contains('dark')?'dark':'light'); }
document.querySelector('#toggle-theme').addEventListener('click', toggleTheme);

// Load DATA from localStorage if exists
let DATA = JSON.parse(localStorage.getItem('kolibri-data')) || {
  "Soğuk İçecekler":[{name:"Ice Latte",price:75,img:"images/cold_drinks/icelatte.png",tags:["Kahve","Sütlü"]}],
  "Sıcak İçecekler":[{name:"Espresso",price:55,img:"assets/placeholder.svg",tags:["Tek Shot"]}],
  "Tatlılar":[{name:"Tiramisu",price:95,img:"images/sweets/Tiramisu.png",tags:["Kakao"]}],
  "Atıştırmalıklar":[{name:"Tost (Kaşarlı)",price:85,img:"images/snacks/kasarli_tost.png",tags:["Vejetaryen"]}]
};
const CATEGORY_IMAGES = {
  "Soğuk İçecekler":"images/category/sogukicecekler.png",
  "Sıcak İçecekler":"images/category/sicakicecekler.png",
  "Tatlılar":"images/category/tatlilar.png",
  "Atıştırmalıklar":"images/category/atistirmaliklar.png"
};

document.getElementById('admin-btn').addEventListener('click', ()=>{
    window.open('admin.html', '_blank'); // Yeni sekmede admin panelini aç
});
// DOM Elements
const categoriesEl=document.querySelector('#categories');
const productsView=document.querySelector('#products-view');
const productGrid=document.querySelector('#product-grid');
const breadcrumbEl=document.querySelector('#breadcrumb');
const searchInput=document.querySelector('#search');
const searchCategory=document.querySelector('#search-category');

let currentCategory=null;
let adminLogged=false;

// Render Categories
function renderCategories(){
  categoriesEl.innerHTML='';
  Object.keys(DATA).forEach(cat=>{
    const count=DATA[cat].length;
    const el=document.createElement('div');
    el.className='category fade-enter';
    el.innerHTML=`<div class="cat-image"><img src="${CATEGORY_IMAGES[cat] || 'assets/placeholder.svg'}" alt="${cat}"></div>
                  <div class="cat-chip">${count}</div>
                  <div class="cat-name">${cat}</div>
                  <div class="cat-note">Sizin için seçtiklerimiz</div>`;
    el.addEventListener('click',()=>openCategory(cat));
    categoriesEl.appendChild(el);
  });
}
renderCategories();

// Category view
function openCategory(cat){
  currentCategory=cat;
  window.scrollTo({top:0, behavior:'smooth'});
  document.querySelector('#home').style.display='none';
  productsView.style.display='block';
  breadcrumbEl.innerHTML=`<a href="#" id="crumb-home">Ana Sayfa</a> / <span>${cat}</span>`;
  document.querySelector('#crumb-home').addEventListener('click',e=>{ e.preventDefault(); backHome(); });
  searchCategory.value='';
  renderProducts(cat);
}
function backHome(){ productsView.style.display='none'; document.querySelector('#home').style.display='block'; currentCategory=null; }

// Render products
function renderProducts(cat){
  const q=(currentCategory?searchCategory.value:searchInput.value).trim().toLowerCase();
  const items=(DATA[cat]||[]).filter(x=>x.name.toLowerCase().includes(q) || x.tags.join(' ').toLowerCase().includes(q));
  productGrid.innerHTML='';
  items.forEach(p=>{
    const card=document.createElement('div');
    card.className='card fade-enter';
    card.innerHTML=`<div class="cover"><img src="${p.img}" alt="${p.name}"/><span class="badge">${formatPrice(p.price)}</span></div>
                    <div class="body"><h3 class="name">${p.name}</h3><p class="price">Fiyat: ${formatPrice(p.price)}</p>
                    <div class="tags">${p.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}</div></div>`;
    productGrid.appendChild(card);
  });
  if(items.length===0){
    const empty=document.createElement('div'); empty.style.opacity=.7; empty.textContent='Sonuç bulunamadı.'; productGrid.appendChild(empty);
  }
}

function formatPrice(tl){ return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(tl); }
searchInput.addEventListener('input',()=>{ if(!currentCategory) renderCategories(); else renderProducts(currentCategory); });
searchCategory.addEventListener('input',()=>{ if(currentCategory) renderProducts(currentCategory); });

// Admin login
const adminBtn=document.querySelector('#admin-login-btn');
const loginModal=document.querySelector('#login-modal');
const loginBtn=document.querySelector('#login-btn');
const adminPanel=document.querySelector('#admin-panel');

adminBtn.addEventListener('click',()=>{ loginModal.style.display='flex'; });
loginBtn.addEventListener('click',()=>{
  const u=document.querySelector('#login-username').value;
  const p=document.querySelector('#login-password').value;
  if(u==='admin' && p==='1234'){ adminLogged=true; loginModal.style.display='none'; adminPanel.style.display='block'; alert('Admin girişi başarılı!'); }
  else{ alert('Kullanıcı adı veya şifre yanlış!'); }
});

function logoutAdmin(){ adminLogged=false; adminPanel.style.display='none'; alert('Çıkış yapıldı.'); }

// Add product
document.querySelector('#add-product-btn').addEventListener('click',()=>{
  if(!adminLogged){ alert('Önce admin girişi yapın!'); return; }
  const name=document.querySelector('#new-name').value.trim();
  const price=parseFloat(document.querySelector('#new-price').value);
  const tags=document.querySelector('#new-tags').value.split(',').map(t=>t.trim()).filter(t=>t);
  const imgInput=document.querySelector('#new-img');
  if(!name || !price || tags.length===0 || imgInput.files.length===0){ alert('Tüm alanları doldurun!'); return; }

  const reader=new FileReader();
  reader.onload=(e)=>{
    const imgSrc=e.target.result;
    const category=currentCategory || 'Diğer';
    if(!DATA[category]) DATA[category]=[];
    DATA[category].push({name, price, tags, img:imgSrc});

    // Save to localStorage
    localStorage.setItem('kolibri-data', JSON.stringify(DATA));

    renderProducts(category);
    renderCategories();
    alert('Ürün eklendi!');
  };
  reader.readAsDataURL(imgInput.files[0]);
});
