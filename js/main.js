import { initFishing } from './games/fishing.js';
import { initCooking } from './games/cooking.js';
import { initCleaning } from './games/cleaning.js';
const saved=JSON.parse(localStorage.getItem('mei-mei-cozy-save')||'{}');
export const state={coins:saved.coins||0,totalFish:saved.totalFish||0,totalMeals:saved.totalMeals||0,totalRooms:saved.totalRooms||0};
export function save(){localStorage.setItem('mei-mei-cozy-save',JSON.stringify(state));updateWallet()}
export function updateWallet(){for(const [id,value] of Object.entries({coins:state.coins,totalFish:state.totalFish,totalMeals:state.totalMeals,totalRooms:state.totalRooms})){const el=document.getElementById(id);if(el)el.textContent=value}}
export function notify(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}
const panel=document.getElementById('game-panel');
const games={fishing:initFishing,cooking:initCooking,cleaning:initCleaning};
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.open;panel.innerHTML='';games[name](panel);panel.scrollIntoView({behavior:'smooth',block:'start'})}));
updateWallet();