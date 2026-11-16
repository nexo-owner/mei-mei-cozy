import { initFishing } from './games/fishing.js';
import { initCooking } from './games/cooking.js';
import { initCleaning } from './games/cleaning.js';
import { initWorld } from './world.js';
import { initImmersion } from './immersion.js';

const SAVE_KEY = 'mei-mei-cozy-save';
function readSave() {
  try { const value = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; }
  catch { return {}; }
}
const saved = readSave();
const numberOrZero = value => Number.isFinite(value) && value >= 0 ? value : 0;
export const state = {
  coins: numberOrZero(saved.coins), totalFish: numberOrZero(saved.totalFish),
  totalMeals: numberOrZero(saved.totalMeals), totalRooms: numberOrZero(saved.totalRooms),
  outfit: saved.outfit || { hat: 'none', top: 'default', accessory: 'none' },
  owned: Array.isArray(saved.owned) ? saved.owned : ['starter-chair'],
  placed: Array.isArray(saved.placed) ? saved.placed : ['starter-chair'],
  visited: Array.isArray(saved.visited) ? saved.visited : []
};
export function updateWallet() {
  for (const [id, value] of Object.entries({ coins:state.coins,totalFish:state.totalFish,totalMeals:state.totalMeals,totalRooms:state.totalRooms,furnitureCount:state.owned.length })) {
    const el=document.getElementById(id); if(el) el.textContent=value;
  }
}
export function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  catch(error) { console.warn('Could not save island progress.',error); }
  updateWallet();
  window.dispatchEvent(new Event('mei-mei-progress'));
}
export function notify(message) {
  const el=document.getElementById('toast'); if(!el)return;
  el.textContent=message; el.classList.add('show'); window.clearTimeout(notify.timeout);
  notify.timeout=window.setTimeout(()=>el.classList.remove('show'),1800);
}
const panel=document.getElementById('game-panel');
const games={fishing:initFishing,cooking:initCooking,cleaning:initCleaning};
let disposeCurrentGame=null;
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{
  const name=button.dataset.open; if(!games[name])return;
  if(disposeCurrentGame)disposeCurrentGame();
  panel.replaceChildren(); disposeCurrentGame=games[name](panel)||null;
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}));
initWorld();
initImmersion();
updateWallet();