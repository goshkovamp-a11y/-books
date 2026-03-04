var cart = {
  hPdt:null, hItems:null, items:{}, iURL:"images/", currency:"₽", total:0,
  save:()=>localStorage.setItem("cart",JSON.stringify(cart.items)),
  load:()=>{cart.items=localStorage.getItem("cart"); cart.items=cart.items?JSON.parse(cart.items):{};},
  nuke:()=>{if(confirm("Очистить корзину?")){cart.items={};localStorage.removeItem("cart");cart.list();}},
  
  init:()=> {
    cart.hPdt=document.getElementById("cart-products");
    cart.hItems=document.getElementById("cart-items");
    cart.hPdt.innerHTML="";
    let template=document.getElementById("template-product").content,p,item;
    for(let id in products){
      p=products[id];
      item=template.cloneNode(true);
      item.querySelector(".p-img").src=cart.iURL+p.img;
      item.querySelector(".p-txt").innerHTML=`<div class="p-name">${p.name}</div><div class="p-desc">${p.desc}</div><div class="p-price">${cart.currency}${p.price}</div>`;
      item.querySelector(".p-add").onclick=()=>cart.add(id);
      cart.hPdt.appendChild(item);
    }
    cart.load(); cart.list();
  },

 add: id => {
  cart.items[id] = cart.items[id] ? cart.items[id] + 1 : 1;
  cart.save();
  cart.list();

  // Сделать кнопку темной
  const buttons = document.querySelectorAll(".p-add");
  buttons.forEach(btn => {
    const pItem = btn.closest(".p-item");
    if (!pItem) return;
    const name = pItem.querySelector(".p-name").textContent;
    if (name === products[id].name) {
      btn.style.background = "#7a0000"; // тёмно-красный
      btn.style.color = "#fff";
    }
  });
},

list: () => {
  cart.total = 0;
  cart.hItems.innerHTML = "";
  let empty = true;
  for (let key in cart.items) { if (cart.items.hasOwnProperty(key)) { empty = false; break; } }

  if (empty) { 
    cart.hItems.innerHTML = "Корзина пуста"; 
  } else {
    let template = document.getElementById("template-cart").content, p, item;
    for (let id in cart.items) {
      p = products[id];
      item = template.cloneNode(true);
      item.querySelector(".c-del").onclick = () => {
        cart.remove(id);
        // вернуть кнопку в нормальное состояние
        const buttons = document.querySelectorAll(".p-add");
        buttons.forEach(btn => {
          const pItem = btn.closest(".p-item");
          if (!pItem) return;
          const name = pItem.querySelector(".p-name").textContent;
          if (name === products[id].name) {
            btn.style.background = "#d32828"; // исходный красный
            btn.style.color = "#fff";
          }
        });
      };
      item.querySelector(".c-name").textContent = p.name;
      item.querySelector(".c-qty").value = cart.items[id];
      item.querySelector(".c-qty").onchange = function () { cart.change(id, this.value); };
      cart.hItems.appendChild(item);
      cart.total += cart.items[id] * p.price;
    }

    item = document.createElement("div");
    item.className = "c-total"; item.id = "c-total";
    item.innerHTML = `ИТОГ: ${cart.currency}${cart.total}`;
    cart.hItems.appendChild(item);

    item = document.getElementById("template-cart-checkout").content.cloneNode(true);
    cart.hItems.appendChild(item);
  }

  // обновление значка корзины
  let count = 0; for (let id in cart.items) { count += cart.items[id]; }
  document.getElementById("cart-count").textContent = count;
},

  checkout: () => {
    if (Object.keys(cart.items).length === 0) { alert("Корзина пуста"); return; }

    const merchantLogin = "Techsoprovozhdenie";
    const password1 = "OJH2T3GWP5rRJpcm7b9g"; // тестовый
    const outSum = cart.total.toFixed(2);
    const invId = Date.now();
    let description = "Оплата книг: ";
    for (let id in cart.items) {
      const p = products[id];
      description += `${p.name} (${cart.items[id]} шт.), `;
    }
    description = description.slice(0, -2);

    const signature = md5(`${merchantLogin}:${outSum}:${invId}:${password1}`);
    const url = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${merchantLogin}&OutSum=${outSum}&InvId=${invId}&Description=${encodeURIComponent(description)}&SignatureValue=${signature}&IsTest=1`;

    window.open(url, "_blank");
  }
};

window.addEventListener("DOMContentLoaded",cart.init);
