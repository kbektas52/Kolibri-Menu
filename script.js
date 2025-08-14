// Tema
const root = document.documentElement;
if(localStorage.getItem('kolibri-theme') === 'dark') root.classList.add('dark');
document.querySelector('#toggle-theme').addEventListener('click', () => {
  root.classList.toggle('dark');
  localStorage.setItem('kolibri-theme', root.classList.contains('dark')?'dark':'light');
});

// Admin aç
document.querySelector('#admin-btn').addEventListener('click', ()=>window.open('admin.html','_blank'));

// Firebase
const db = firebase.database();

// DOM
const categoriesEl = document.getElementById('categories');
const productsView = document.getElementById('products-view');
const productGrid = document.getElementById('product-grid');
const breadcrumbEl = document.getElementById('breadcrumb');
const searchAllInput = document.getElementById('search');
const searchCategory = document.getElementById('search-category');
const backBtn = document.getElementById('back-btn');

let currentCategory = null;
let currentProductsRef = null;
let currentProductsCache = [];

// Kategorileri gerçek zamanlı al
db.ref('categories').on('value', snapshot=>{
  renderCategories(snapshot);
});

function renderCategories(snapshot){
  categoriesEl.innerHTML = '';
  if(!snapshot.exists()){
    const empty = document.createElement('div');
    empty.style.opacity=.8; empty.textContent='Henüz kategori yok.';
    categoriesEl.appendChild(empty);
    return;
  }

  const q = (searchAllInput.value||'').trim().toLowerCase();
  snapshot.forEach(child=>{
    const name = child.key;
    if(q && !name.toLowerCase().includes(q)) return;

    const el = document.createElement('div');
    el.className='category fade-enter';

    db.ref('products/'+name).once('value').then(prodSnap=>{
      const count = prodSnap.exists()? prodSnap.numChildren():0;
      el.innerHTML = `
        <div class="cat-name">${name}</div>
        <div class="cat-note">Sizin için seçtiklerimiz</div>
        <div class="cat-chip">${count}</div>
      `;
    });

    el.addEventListener('click', ()=>openCategory(name));
    categoriesEl.appendChild(el);
  });
}

// Kategori aç
function openCategory(cat){
  currentCategory=cat;
  window.scrollTo({top:0, behavior:'smooth'});
  document.querySelector('#home').style.display='none';
  productsView.style.display='block';
  breadcrumbEl.innerHTML=`<a href="#" id="crumb-home">Ana Sayfa</a> / <span>${cat}</span>`;
  document.querySelector('#crumb-home').addEventListener('click', e=>{e.preventDefault(); backHome();});

  searchCategory.value='';

  if(currentProductsRef) currentProductsRef.off();
  currentProductsRef = db.ref('products/'+cat);
  currentProductsRef.on('value', snap=>{
    const arr=[];
    snap.forEach(child=>arr.push({key:child.key, ...child.val()}));
    currentProductsCache=arr;
    renderProducts();
  });
}

// Ürünleri render
function renderProducts(){
  const q=(searchCategory.value||'').trim().toLowerCase();
  const items=currentProductsCache.filter(x=>{
    const nameMatch=(x.name||'').toLowerCase().includes(q);
    const tagMatch=(Array.isArray(x.tags)?x.tags.join(' '):'').toLowerCase().includes(q);
    return nameMatch || tagMatch || q==='';
  });

  productGrid.innerHTML='';
  if(items.length===0){
    const empty = document.createElement('div'); empty.style.opacity=.8;
    empty.textContent='Bu kategoride ürün bulunamadı.'; productGrid.appendChild(empty);
    return;
  }

  items.forEach(p=>{
    const card = document.createElement('div');
    card.className='card fade-enter';
    card.innerHTML=`
      <div class="cover">
        ${p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy"/>`:''}
        <span class="badge">${formatPrice(p.price||0)}</span>
      </div>
      <div class="body">
        <h3 class="name">${p.name||''}</h3>
        <p class="price">Fiyat: ${formatPrice(p.price||0)}</p>
        <div class="tags">${
          Array.isArray(p.tags)?p.tags.map(t=>`<span class="tag">#${t}</span>`).join(''):''
        }</div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

// Yardımcılar
function backHome(){
  if(currentProductsRef) currentProductsRef.off();
  currentProductsRef=null;
  productsView.style.display='none';
  document.querySelector('#home').style.display='block';
  currentCategory=null;
}
function formatPrice(tl){
  try{return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Number(tl)||0);}
  catch(e){return(Number(tl)||0)+' ₺';}
}

// Event bindings
backBtn.addEventListener('click', backHome);
searchAllInput.addEventListener('input', ()=>db.ref('categories').once('value').then(renderCategories));
searchCategory.addEventListener('input', renderProducts);
