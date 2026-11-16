import { state, save, notify, updateWallet } from './main.js';

const places = [
  {id:'home',emoji:'🏡',name:'Your Cottage',desc:'Decorate your cosy little home',target:'#home'},
  {id:'pond',emoji:'🎣',name:'Sunny Pond',desc:'Go fishing with Mei Mei',target:'#activities'},
  {id:'kitchen',emoji:'🍳',name:'Little Kitchen',desc:'Make a delicious meal',target:'#activities'},
  {id:'garden',emoji:'🌷',name:'Flower Garden',desc:'A quiet place to relax',target:'#wardrobe'},
  {id:'shop',emoji:'🛍️',name:'Furniture Shop',desc:'Find something lovely',target:'#shop'}
];
const clothes = {
  hat:[['none','No hat','🐱'],['flower','Flower crown','🌼'],['beret','Cosy beret','🧢'],['bow','Big bow','🎀'],['straw','Sun hat','👒']],
  top:[['default','Everyday outfit','🤎'],['pink','Pink cardigan','🩷'],['mint','Mint jumper','💚'],['blue','Blue overalls','💙'],['lavender','Lavender dress','💜']],
  accessory:[['none','No accessory','🐾'],['scarf','Soft scarf','🧣'],['bell','Golden bell','🔔'],['bag','Tiny tote bag','👜']]
};
const furniture = [
  {id:'starter-chair',name:'Little wooden chair',emoji:'🪑',price:0,desc:'A simple cottage classic'},
  {id:'flower-rug',name:'Daisy rug',emoji:'🌼',price:25,desc:'A soft spot for sunny naps'},
  {id:'bookshelf',name:'Tiny bookshelf',emoji:'📚',price:45,desc:'For all your favourite stories'},
  {id:'plant',name:'Potted plant',emoji:'🪴',price:30,desc:'A little bit of green'},
  {id:'tea-table',name:'Tea table',emoji:'🫖',price:55,desc:'Perfect for afternoon tea'},
  {id:'lamp',name:'Starry lamp',emoji:'💡',price:65,desc:'A warm evening glow'},
  {id:'bed',name:'Cloud-soft bed',emoji:'🛏️',price:90,desc:'The cosiest sleep ever'},
  {id:'sofa',name:'Peachy sofa',emoji:'🛋️',price:110,desc:'A comfy place to unwind'},
  {id:'flower-vase',name:'Flower vase',emoji:'💐',price:40,desc:'Fresh flowers for home'},
  {id:'clock',name:'Cottage clock',emoji:'🕰️',price:75,desc:'Never lose track of tea time'}
];
const $=id=>document.getElementById(id);
function avatar(){const o=state.outfit;return '<div class="avatar-preview"><img src="assets/images/mei-mei.svg" alt="Mei Mei"><span class="avatar-hat">'+(clothes.hat.find(x=>x[0]===o.hat)||clothes.hat[0])[2]+'</span><span class="avatar-top">'+(clothes.top.find(x=>x[0]===o.top)||clothes.top[0])[2]+'</span><span class="avatar-accessory">'+(clothes.accessory.find(x=>x[0]===o.accessory)||clothes.accessory[0])[2]+'</span></div>';}
function renderWardrobe(){
  const root=$('wardrobe-panel');
  root.innerHTML='<div class="wardrobe-layout"><div class="avatar-stage">'+avatar()+'<h3>Looking lovely, Mei Mei!</h3><p>Try a new look and press save.</p></div><div class="wardrobe-options">'+Object.entries(clothes).map(([type,items])=>'<div class="option-group"><h3>'+({hat:'🎩 Hats',top:'👗 Outfits',accessory:'🎀 Accessories'}[type])+'</h3><div class="option-grid">'+items.map(item=>'<button type="button" class="option '+(state.outfit[type]===item[0]?'selected':'')+'" data-clothing="'+type+'" data-value="'+item[0]+'"><span>'+item[2]+'</span>'+item[1]+'</button>').join('')+'</div></div>').join('')+'<button class="button" id="save-outfit">Save this outfit ♡</button></div></div>';
  root.querySelectorAll('[data-clothing]').forEach(button=>button.addEventListener('click',()=>{state.outfit[button.dataset.clothing]=button.dataset.value;renderWardrobe()}));
  $('save-outfit').addEventListener('click',()=>{save();notify('Mei Mei looks adorable! ✨')});
}
function renderShop(){
  const root=$('shop-panel');
  root.innerHTML='<div class="shop-balance">🪙 Your balance: <b>'+state.coins+'</b> coins</div><div class="shop-grid">'+furniture.map(item=>{const owned=state.owned.includes(item.id);return '<article class="shop-item"><div class="shop-emoji">'+item.emoji+'</div><h3>'+item.name+'</h3><p>'+item.desc+'</p><div class="shop-buy"><b>'+(item.price===0?'Free':('🪙 '+item.price))+'</b><button type="button" class="small-button" data-buy="'+item.id+'" '+(owned?'disabled':'')+'>'+(owned?'Owned':'Buy')+'</button></div></article>'}).join('')+'</div>';
  root.querySelectorAll('[data-buy]').forEach(button=>button.addEventListener('click',()=>{const item=furniture.find(x=>x.id===button.dataset.buy);if(!item||state.owned.includes(item.id))return;if(state.coins<item.price){notify('You need '+(item.price-state.coins)+' more coins!');return;}state.coins-=item.price;state.owned.push(item.id);save();renderShop();renderHome();notify(item.name+' added to your furniture!')}));
}
function renderHome(){
  const root=$('home-panel');
  const owned=furniture.filter(item=>state.owned.includes(item.id));
  root.innerHTML='<div class="home-room"><div class="room-wall"><span>♡ Mei Mei\\'s cottage ♡</span><div class="placed-items">'+(state.placed.map(id=>furniture.find(x=>x.id===id)).filter(Boolean).map(item=>'<span title="'+item.name+'">'+item.emoji+'</span>').join('')||'<p>Your room is waiting for furniture!</p>')+'</div><div class="room-floor">✿ ✿ ✿ ✿ ✿</div></div></div><h3 class="place-title">Your furniture</h3><div class="owned-grid">'+owned.map(item=>'<button type="button" class="owned-item '+(state.placed.includes(item.id)?'in-room':'')+'" data-place="'+item.id+'"><span>'+item.emoji+'</span>'+item.name+'<small>'+(state.placed.includes(item.id)?'✓ In cottage':'＋ Place in cottage')+'</small></button>').join('')+'</div>';
  root.querySelectorAll('[data-place]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.place;state.placed=state.placed.includes(id)?state.placed.filter(x=>x!==id):[...state.placed,id];save();renderHome()}));
}
function initWorld(){
  $('island-board').innerHTML=places.map(place=>'<button type="button" class="island-place" data-place="'+place.id+'"><span>'+place.emoji+'</span><b>'+place.name+'</b><small>'+place.desc+'</small></button>').join('');
  $('island-board').querySelectorAll('[data-place]').forEach(button=>button.addEventListener('click',()=>{const place=places.find(x=>x.id===button.dataset.place);if(!place)return; if(!state.visited.includes(place.id))state.visited.push(place.id);save();$('island-note').textContent=place.emoji+' '+place.name+': '+place.desc+' ♡';if(place.target)document.querySelector(place.target).scrollIntoView({behavior:'smooth'});}));
  renderWardrobe();renderShop();renderHome();updateWallet();
}
export { initWorld };