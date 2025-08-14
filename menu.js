// menu.js (Realtime Database versiyonu)
const menuContainer = document.getElementById("menuContainer");

// Kategorileri ve ürünleri yükle
function renderMenu(categories) {
  menuContainer.innerHTML = "";

  categories.forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.classList.add("category");

    const title = document.createElement("h3");
    title.textContent = cat.name;
    title.addEventListener("click", () => {
      catDiv.classList.toggle("open");
    });

    // Ürünleri getir
    const productsDiv = document.createElement("div");
    productsDiv.classList.add("products");

    if (cat.products) {
      Object.entries(cat.products).forEach(([prodKey, prod]) => {
        const prodDiv = document.createElement("div");
        prodDiv.classList.add("product");
        prodDiv.innerHTML = `
          <img src="${prod.img || ''}" alt="${prod.name}" />
          <p>${prod.name}</p>
          <p>${prod.price}₺</p>
        `;
        productsDiv.appendChild(prodDiv);
      });
    }

    catDiv.appendChild(title);
    catDiv.appendChild(productsDiv);
    menuContainer.appendChild(catDiv);
  });
}

// Realtime dinleme
firebase.database().ref("categories").on("value", snapshot => {
  const categories = [];
  snapshot.forEach(catSnap => {
    const catName = catSnap.key;
    categories.push({ name: catName });
  });

  // Aynı anda ürünleri de dinle
  firebase.database().ref("products").on("value", prodSnap => {
    const productsByCat = prodSnap.val() || {};
    const fullCats = categories.map(c => ({
      ...c,
      products: productsByCat[c.name] || {}
    }));
    renderMenu(fullCats);
  });
});
