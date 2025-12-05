// main.js - frontend interactions
const API_BASE = "http://localhost:8080/api";

async function fetchMenu(){
  try{
    const res = await fetch(API_BASE + "/menu");
    const json = await res.json();
    renderMenu(json);
  }catch(e){
    console.error(e);
    document.getElementById('menuList') && (document.getElementById('menuList').innerText = 'Failed to load menu');
  }
}

function renderMenu(items){
  const root = document.getElementById('menuList');
  if(!root) return;
  root.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<strong>${it.name}</strong><div>Price: $${it.price.toFixed(2)}</div><button class="btn">Add</button>`;
    card.querySelector('button').addEventListener('click', ()=> addToCart(it));
    root.appendChild(card);
  });
}

let CART = [];
function addToCart(item){ CART.push(item); renderCart(); }
function renderCart(){
  const ul = document.getElementById('cartItems');
  if(!ul) return;
  ul.innerHTML = '';
  CART.forEach((it,idx)=>{
    const li = document.createElement('li'); li.innerText = `${it.name} - $${it.price.toFixed(2)}`;
    const rm = document.createElement('button'); rm.innerText='Remove'; rm.className='btn';
    rm.style.marginLeft='8px';
    rm.addEventListener('click', ()=> { CART.splice(idx,1); renderCart(); });
    li.appendChild(rm);
    ul.appendChild(li);
  });
}

async function checkout(){
  if(!CART.length){ alert('Cart empty'); return; }
  const pickup = document.getElementById('pickup') ? document.getElementById('pickup').value : '';
  const body = { items: CART.map(i=>i.id), pickup_time: pickup || null };
  const res = await fetch(API_BASE + '/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(res.ok){ alert('Order placed'); CART=[]; renderCart(); } else { alert('Failed to place order'); }
}

document.addEventListener('DOMContentLoaded', ()=>{
  fetchMenu();
  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn && checkoutBtn.addEventListener('click', checkout);

  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const res = await fetch(API_BASE + '/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password})});
      const msg = document.getElementById('msg');
      if(res.ok){ msg.innerText = 'Login success'; const j=await res.json(); localStorage.setItem('token', j.token || ''); window.location='menu.html'; }
      else { msg.innerText = 'Login failed'; }
    });
  }

  const addTruck = document.getElementById('addTruck');
  addTruck && addTruck.addEventListener('click', async (e)=>{ e.preventDefault(); const name=document.getElementById('truckName').value; const loc=document.getElementById('truckLocation').value; await fetch(API_BASE + '/trucks', {method:'POST',headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,location:loc})}); alert('Truck added'); });

  const addItem = document.getElementById('addItem');
  addItem && addItem.addEventListener('click', async (e)=>{ e.preventDefault(); const truck_id=document.getElementById('itemTruckId').value; const name=document.getElementById('itemName').value; const price=document.getElementById('itemPrice').value; await fetch(API_BASE + '/menu', {method:'POST',headers:{'Content-Type':'application/json'}, body: JSON.stringify({truck_id,name,price})}); alert('Item added'); });
});
