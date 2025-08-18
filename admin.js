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
const auth = firebase.auth();

// ----------------- DOM -----------------
const loginForm = document.getElementById('login-form');
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('login-btn');
const loginMsg = document.getElementById('login-msg');

const newCatInput = document.getElementById('new-category-name');
const updateCatInput = document.getElementById('update-category-name');
const addCatBtn = document.getElementById('add-cat-btn');
const updateCatBtn = document.getElementById('update-cat-btn');
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
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginMsg.textContent = '';
      loginForm.style.display = 'none';
      adminPanel.style.display = 'block';
      loadCategoriesToSelect();
      refreshProductSelects();
    })
    .catch(err => {
      console.error(err);
      loginMsg.textContent = 'Hatalı giriş! ';
    });
});

// ----------------- Auth durumu koru -----------------
auth.onAuthStateChanged(user => {
  if (user) {
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
    loadCategoriesToSelect();
    refreshProductSelects();
  } else {
    loginForm.style.display = 'block';
    adminPanel.style.display = 'none';
  }
});

// ----------------- Çıkış butonu -----------------
document.getElementById('logout-btn').addEventListener('click', () => {
  auth.signOut().then(() => {
    loginForm.style.display = 'block';
    adminPanel.style.display = 'none';
  });
});

// ----------------- Yan menü sekme kontrolü -----------------
document.querySelectorAll('aside button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sec = btn.dataset.section;
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.getElementById(sec).classList.add('active');
  });
});

// ----------------- Kategori -----------------
addCatBtn.addEventListener('click', ()=> {
  if(!auth.currentUser) return alert('Login olmalısınız!');
  const name = newCatInput.value.trim();
  const imgFile = document.getElementById('new-category-img')?.files[0];
  if(!name) return alert('Kategori adı boş olamaz!');

  const saveCategory = (imgData)=>{
    db.ref('categories/'+name).set({ createdAt: Date.now(), img: imgData||'' })
      .then(()=>{
        alert(`"${name}" eklendi.`);
        newCatInput.value='';
        if(imgFile) document.getElementById('new-category-img').value='';
        loadCategoriesToSelect();
      });
  };

  if(imgFile){
    const reader = new FileReader();
    reader.onload = e=>saveCategory(e.target.result);
    reader.readAsDataURL(imgFile);
  } else saveCategory('');
});

// ----------------- Kategori sil (entegre) -----------------
deleteCatBtn.addEventListener('click', ()=> {
  if(!auth.currentUser) return alert('Login olmalısınız!');
  const cat = deleteCatSelect.value;
  if(!cat) return alert('Silinecek kategori seçin!');
  if(!confirm(`"${cat}" silinsin mi?`)) return;

  db.ref('categories/'+cat).remove()
    .then(()=> db.ref('products/'+cat).remove())
    .then(()=>{
      alert(`"${cat}" kategorisi ve içindeki tüm ürünler silindi.`);
      loadCategoriesToSelect();
      refreshProductSelects();
    })
    .catch(err => console.error('Kategori silme hatası:', err));
});

// ----------------- Kategori güncelle -----------------
updateCatBtn.addEventListener('click', ()=>{
  const updateCatSelect = document.getElementById('update-category-select');
  const oldName = updateCatSelect.value;
  const newName = updateCatInput.value.trim();
  if(!oldName || !newName) return alert('Kategori seçin ve yeni ad girin!');
  if(oldName === newName) return alert('Yeni isim eski isimle aynı olamaz!');

  db.ref('categories/'+oldName).once('value').then(snap=>{
    const data = snap.val();
    if(!data) return alert('Kategori bulunamadı!');
    db.ref('categories/'+newName).set(data)
      .then(()=>{
        db.ref('products/'+oldName).once('value').then(prodSnap=>{
          const prods = prodSnap.val()||{};
          db.ref('products/'+newName).set(prods)
            .then(()=>{
              db.ref('categories/'+oldName).remove();
              db.ref('products/'+oldName).remove();
              alert('Kategori başarıyla güncellendi!');
              updateCatInput.value='';
              loadCategoriesToSelect();
              refreshProductSelects();
            });
        });
      });
  });
});

// ----------------- Dropdownları yükle -----------------
function loadCategoriesToSelect(){
  db.ref('categories').once('value').then(snapshot=>{
    deleteCatSelect.innerHTML='';
    prodCatSelect.innerHTML='';
    const updateCatSelect = document.getElementById('update-category-select');
    updateCatSelect.innerHTML = '';

    snapshot.forEach(child=>{
      const c = child.key;
      const opt1 = document.createElement('option'); 
      opt1.value = c; opt1.textContent = c;
      deleteCatSelect.appendChild(opt1);

      const opt2 = document.createElement('option'); 
      opt2.value = c; opt2.textContent = c;
      prodCatSelect.appendChild(opt2);

      const opt3 = document.createElement('option'); 
      opt3.value = c; opt3.textContent = c;
      updateCatSelect.appendChild(opt3);
    });
  });
}

// ----------------- Ürün -----------------
addProductBtn.addEventListener('click', ()=>{
  if(!auth.currentUser) return alert('Login olmalısınız!');
  const name = document.getElementById('new-name').value.trim();
  const price = Number(document.getElementById('new-price').value);
  const tags = document.getElementById('new-tags').value.split(',').map(t=>t.trim()).filter(t=>t);
  const category = prodCatSelect.value;
  const imgFile = document.getElementById('new-img').files[0];
  if(!name || !category) return alert('Ad ve kategori zorunlu!');

  const uploadProduct = (imgData)=>{
    const newKey = db.ref('products/'+category).push().key;
    db.ref('products/'+category+'/'+newKey).set({name, price, tags, img: imgData||''})
      .then(()=>{
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

// ----------------- Ürün dropdownlarını güncelle -----------------
function refreshProductSelects(){
  if(!auth.currentUser) return;
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
  if(!auth.currentUser) return alert('Login olmalısınız!');
  if(!productSelect.value) return alert('Ürün seçin!');
  const sel = JSON.parse(productSelect.value);
  db.ref('products/'+sel.cat+'/'+sel.prodKey).once('value').then(snap=>{
    const prod = snap.val() || {};
    const name = updateName.value.trim() || prod.name || '';
    const price = updatePrice.value.trim() ? Number(updatePrice.value) : (prod.price||0);
    const tags = updateTags.value.trim() ? updateTags.value.split(',').map(t=>t.trim()).filter(t=>t) : (Array.isArray(prod.tags)?prod.tags:[]);
    const imgFile = updateImg.files[0];

    const updateProduct = (imgData)=>{
      const dataToUpdate = { name, price, tags };
      if(imgData !== undefined) dataToUpdate.img = imgData;
      db.ref('products/'+sel.cat+'/'+sel.prodKey).update(dataToUpdate).then(()=>{
        alert('Ürün başarıyla güncellendi!');
        refreshProductSelects();
        updateName.value=''; updatePrice.value=''; updateTags.value=''; updateImg.value='';
      });
    };

    if(imgFile){
      const reader = new FileReader();
      reader.onload = e=>updateProduct(e.target.result);
      reader.readAsDataURL(imgFile);
    } else updateProduct();
  });
});

// ----------------- Ürün sil -----------------
deleteProductBtn.addEventListener('click', ()=>{
  if(!auth.currentUser) return alert('Ürün seçin!');
  if(!deleteProductSelect.value) return alert('Ürün seçin!');
  const sel = JSON.parse(deleteProductSelect.value);
  if(!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
  db.ref('products/'+sel.cat+'/'+sel.prodKey).remove().then(()=>{
    alert('Ürün silindi!');
    refreshProductSelects();
  });
});
