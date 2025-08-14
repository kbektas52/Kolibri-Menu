// ----------------- Firebase -----------------
const firebaseConfig = {
  apiKey: "AIzaSyB0ovBZWhYLM42ld58gMydBeaaPsUcI-0k",
  authDomain: "kolibri-menu-bae3a.firebaseapp.com",
  databaseURL: "https://kolibri-menu-bae3a-default-rtdb.firebaseio.com",
  projectId: "kolibri-menu-bae3a",
  storageBucket: "kolibri-menu-bae3a.firebasestorage.app",
  messagingSenderId: "903898711438",
  appId: "1:903898711438:web:f545eaae8f97bd1c34d0df",
  measurementId: "G-QCRYDKMB4L"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ----------------- DOM -----------------
const loginForm = document.getElementById('login-form');
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('login-btn');
const loginMsg = document.getElementById('login-msg');

const newCatInput = document.getElementById('new-category-name');
const addCatBtn = document.getElementById('add-cat-btn');
const deleteCatSelect = document.getElementById('delete-category-select');
const deleteCatBtn = document.getElementById('delete-cat-btn');
const prodCatSelect = document.getElementById('new-category');

const addProductBtn = document.getElementById('save-new-btn');
const productSelect = document.getElementById('product-select');
const updateName = document.getElementById('update-name');
const updatePrice = document.getElementById('update-price');
const updateTags = document.getElementById('update-tags');
const updateImg = document.getElementById('update-img');
const saveUpdateBtn = document.getElementById('save-update-btn');
const deleteProductSelect = document.getElementById('delete-product-select');
const deleteProductBtn = document.getElementById('delete-btn');

// ----------------- Login -----------------
loginBtn.addEventListener('click', () => {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if(u==='admin' && p==='1234'){
    loginForm.style.display='none';
    adminPanel.style.display='block';
    loadCategoriesToSelect();
    refreshProductSelects();
  } else {
    loginMsg.textContent='Hatalı kullanıcı adı veya şifre';
  }
});

// ----------------- Bölüm göster -----------------
function showSection(id){
  document.querySelectorAll('.section').forEach(s => s.style.display='none');
  document.getElementById(id).style.display='block';
}
document.getElementById('add-product-btn').addEventListener('click', ()=>showSection('add-product-section'));
document.getElementById('update-product-btn').addEventListener('click', ()=>showSection('update-product-section'));
document.getElementById('delete-product-btn').addEventListener('click', ()=>showSection('delete-product-section'));
document.getElementById('category-btn').addEventListener('click', ()=>showSection('category-section'));

// ----------------- Kategori -----------------
addCatBtn.addEventListener('click', ()=>{
  const name = newCatInput.value.trim();
  if(!name) return alert('Kategori adı boş olamaz!');
  db.ref('categories/'+name).set({createdAt:Date.now()})
    .then(()=>{
      alert(`"${name}" eklendi.`);
      newCatInput.value='';
      loadCategoriesToSelect();
    });
});

deleteCatBtn.addEventListener('click', ()=>{
  const cat = deleteCatSelect.value;
  if(!cat) return alert('Silinecek kategori seçin!');
  if(!confirm(`"${cat}" silinsin mi?`)) return;
  db.ref('categories/'+cat).remove()
    .then(()=>db.ref('products/'+cat).remove())
    .then(()=>{
      alert(`"${cat}" silindi.`);
      loadCategoriesToSelect();
      refreshProductSelects();
    });
});

// Kategori dropdownlarını yükle
function loadCategoriesToSelect(){
  db.ref('categories').once('value').then(snapshot=>{
    deleteCatSelect.innerHTML='';
    prodCatSelect.innerHTML='';
    snapshot.forEach(child=>{
      const c = child.key;
      const opt1 = document.createElement('option'); opt1.value=c; opt1.textContent=c;
      deleteCatSelect.appendChild(opt1);
      const opt2 = document.createElement('option'); opt2.value=c; opt2.textContent=c;
      prodCatSelect.appendChild(opt2);
    });
  });
}

// ----------------- Ürün -----------------
addProductBtn.addEventListener('click', ()=>{
  const name = document.getElementById('new-name').value.trim();
  const price = Number(document.getElementById('new-price').value);
  const tags = document.getElementById('new-tags').value.split(',').map(t=>t.trim()).filter(t=>t);
  const category = prodCatSelect.value;
  const imgFile = document.getElementById('new-img').files[0];
  if(!name || !category) return alert('Ad ve kategori zorunlu!');

  const uploadProduct = (imgData)=>{
    const newKey = db.ref('products/'+category).push().key;
    db.ref('products/'+category+'/'+newKey).set({
      name,
      price,
      tags,
      img: imgData||''
    }).then(()=>{
      alert('Ürün eklendi!');
      document.getElementById('new-name').value='';
      document.getElementById('new-price').value='';
      document.getElementById('new-tags').value='';
      document.getElementById('new-img').value='';
      refreshProductSelects();
    });
  };

  if(imgFile){
    const reader = new FileReader();
    reader.onload = e=>uploadProduct(e.target.result);
    reader.readAsDataURL(imgFile);
  } else uploadProduct('');
});

// Ürün dropdownlarını güncelle
function refreshProductSelects(){
  productSelect.innerHTML='';
  deleteProductSelect.innerHTML='';
  db.ref('products').once('value').then(snapshot=>{
    snapshot.forEach(catSnap=>{
      const cat = catSnap.key;
      catSnap.forEach(prodSnap=>{
        const prodKey = prodSnap.key;
        const prod = prodSnap.val();
        const opt1 = document.createElement('option');
        opt1.value=JSON.stringify({cat,prodKey});
        opt1.textContent=`${prod.name} (${cat})`;
        productSelect.appendChild(opt1);
        const opt2 = document.createElement('option');
        opt2.value=JSON.stringify({cat,prodKey});
        opt2.textContent=`${prod.name} (${cat})`;
        deleteProductSelect.appendChild(opt2);
      });
    });
  });
}

// ----------------- Ürün Güncelle -----------------
saveUpdateBtn.addEventListener('click', ()=>{
  const sel = JSON.parse(productSelect.value);
  db.ref('products/'+sel.cat+'/'+sel.prodKey).once('value').then(snap=>{
    const prod = snap.val() || {};

    const name = updateName.value.trim() !== '' ? updateName.value.trim() : (prod.name || '');
    const price = updatePrice.value.trim() !== '' ? Number(updatePrice.value) : (prod.price || 0);
    const tags = updateTags.value.trim() !== ''
      ? updateTags.value.split(',').map(t=>t.trim()).filter(t=>t)
      : (Array.isArray(prod.tags) ? prod.tags : []);
    const imgFile = updateImg.files[0];

    const updateProduct = (imgData)=>{
      const dataToUpdate = { name, price, tags };
      if(imgData !== undefined) dataToUpdate.img = imgData; // eski resmi sil
      db.ref('products/'+sel.cat+'/'+sel.prodKey).update(dataToUpdate)
        .then(()=>{
          alert('Ürün başarıyla güncellendi!'); // popup
          refreshProductSelects();
          updateName.value='';
          updatePrice.value='';
          updateTags.value='';
          updateImg.value='';
        });
    };

    if(imgFile){
      const reader = new FileReader();
      reader.onload = e=>updateProduct(e.target.result);
      reader.readAsDataURL(imgFile);
    } else {
      updateProduct(); // imgData olmadan sadece diğer alanları güncelle
    }
  });
});

// Ürün sil
deleteProductBtn.addEventListener('click', ()=>{
  const sel = JSON.parse(deleteProductSelect.value);
  if(!sel) return;
  if(!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
  db.ref('products/'+sel.cat+'/'+sel.prodKey).remove().then(()=>{
    alert('Ürün silindi!');
    refreshProductSelects();
  });
});
