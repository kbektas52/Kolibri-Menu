// Örnek kullanıcı adı ve şifre
const USERNAME = "admin";
const PASSWORD = "1234";

// DATA objesi localStorage üzerinden
let DATA = JSON.parse(localStorage.getItem('kolibri-data')) || {
  "Soğuk İçecekler": [],
  "Sıcak İçecekler": [],
  "Tatlılar": [],
  "Atıştırmalıklar": []
};

// Login işlemi
const loginBtn = document.getElementById('login-btn');
const loginMsg = document.getElementById('login-msg');
loginBtn.addEventListener('click', ()=>{
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if(u === USERNAME && p === PASSWORD){
    document.getElementById('login-form').style.display='none';
    document.getElementById('admin-panel').style.display='block';
    refreshProductSelects();
    refreshCategorySelects();
  }else{
    loginMsg.textContent='Hatalı kullanıcı adı veya şifre';
  }
});

// Panel butonları
document.getElementById('update-product-btn').addEventListener('click', ()=>showSection('update-product-section'));
document.getElementById('delete-product-btn').addEventListener('click', ()=>showSection('delete-product-section'));
document.getElementById('add-category-btn').addEventListener('click', ()=>showSection('add-category-section'));
document.getElementById('add-product-btn').addEventListener('click', ()=>showSection('add-product-section'));

function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.style.display='none');
  document.getElementById(id).style.display='block';
}

// Ürün dropdownlarını güncelle
function refreshProductSelects(){
  const updateSelect = document.getElementById('product-select');
  const deleteSelect = document.getElementById('delete-product-select');
  updateSelect.innerHTML='';
  deleteSelect.innerHTML='';
  Object.keys(DATA).forEach(cat=>{
    DATA[cat].forEach((p,i)=>{
      const opt = document.createElement('option');
      opt.value=JSON.stringify({cat,i});
      opt.textContent=`${p.name} (${cat})`;
      updateSelect.appendChild(opt.cloneNode(true));
      deleteSelect.appendChild(opt.cloneNode(true));
    });
  });
  // Yeni ürün kategorisi dropdownu
  const newProdCat = document.getElementById('new-product-category');
  newProdCat.innerHTML = '';
  Object.keys(DATA).forEach(cat=>{
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    newProdCat.appendChild(opt);
  });
}

// Kategori dropdown
function refreshCategorySelects(){
  const delCat = document.getElementById('delete-category-select');
  delCat.innerHTML = '';
  Object.keys(DATA).forEach(cat=>{
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    delCat.appendChild(opt);
  });
}

// Ürün güncelleme
document.getElementById('save-update-btn').addEventListener('click', ()=>{
  const sel = JSON.parse(document.getElementById('product-select').value);
  const p = DATA[sel.cat][sel.i];
  p.name = document.getElementById('update-name').value || p.name;
  p.price = Number(document.getElementById('update-price').value) || p.price;
  const tags = document.getElementById('update-tags').value;
  if(tags) p.tags = tags.split(',').map(t=>t.trim());
  const imgFile = document.getElementById('update-img').files[0];
  if(imgFile){
    const reader = new FileReader();
    reader.onload = function(e){
      p.img = e.target.result;
      saveData();
      refreshProductSelects();
      alert('Güncellendi!');
    }
    reader.readAsDataURL(imgFile);
  }else{
    saveData();
    refreshProductSelects();
    alert('Güncellendi!');
  }
});

// Ürün silme
document.getElementById('delete-btn').addEventListener('click', ()=>{
  if(!confirm('Ürünü silmek istediğinize emin misiniz?')) return;
  const sel = JSON.parse(document.getElementById('delete-product-select').value);
  DATA[sel.cat].splice(sel.i,1);
  saveData();
  refreshProductSelects();
  alert('Ürün silindi!');
});

// Yeni ürün ekleme
document.getElementById('add-product-btn-save').addEventListener('click', ()=>{
  const name = document.getElementById('new-product-name').value.trim();
  const price = Number(document.getElementById('new-product-price').value);
  const tags = document.getElementById('new-product-tags').value.split(',').map(t=>t.trim());
  const cat = document.getElementById('new-product-category').value;
  const imgFile = document.getElementById('new-product-img').files[0];
  if(!name || !price || !cat) return alert('Eksik bilgi!');
  
  const newProduct = {name, price, tags, img:''};
  if(imgFile){
    const reader = new FileReader();
    reader.onload = function(e){
      newProduct.img = e.target.result;
      DATA[cat].push(newProduct);
      saveData();
      refreshProductSelects();
      alert('Ürün eklendi!');
    }
    reader.readAsDataURL(imgFile);
  }else{
    DATA[cat].push(newProduct);
    saveData();
    refreshProductSelects();
    alert('Ürün eklendi!');
  }
});

// Kategori ekleme
document.getElementById('add-cat-btn').addEventListener('click', ()=>{
  const name = document.getElementById('new-category').value.trim();
  if(name && !DATA[name]){
    DATA[name]=[];
    saveData();
    refreshCategorySelects();
    refreshProductSelects();
    alert('Kategori eklendi!');
    document.getElementById('new-category').value='';
  }else{
    alert('Geçersiz veya mevcut kategori!');
  }
});

// Kategori silme
document.getElementById('delete-cat-btn').addEventListener('click', ()=>{
  const cat = document.getElementById('delete-category-select').value;
  if(!confirm(`"${cat}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
  delete DATA[cat];
  saveData();
  refreshCategorySelects();
  refreshProductSelects();
  alert('Kategori silindi!');
});

// LocalStorage kaydet ve diğer sekmeleri bilgilendir
function saveData(){
  localStorage.setItem('kolibri-data', JSON.stringify(DATA));
  localStorage.setItem('kolibri-refresh', Date.now());
}
