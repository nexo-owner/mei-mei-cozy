import { initFishing } from './games/fishing.js';
import { initCooking } from './games/cooking.js';
import { initCleaning } from './games/cleaning.js';

const SAVE_KEY = 'mei-mei-cozy-save';
function readSave() {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}
const saved = readSave();
const numberOrZero = value => Number.isFinite(value) && value >= 0 ? value : 0;
export const state = {
  coins: numberOrZero(saved.coins),
  totalFish: numberOrZero(saved.totalFish),
  totalMeals: numberOrZero(saved.totalMeals),
  totalRooms: numberOrZero(saved.totalRooms)
};

export function updateWallet() {
  for (const [id, value] of Object.entries({
    coins: state.coins,
    totalFish: state.totalFish,
    totalMeals: state.totalMeals,
    totalRooms: state.totalRooms
  })) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }
}
export function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Mei Mei progress could not be saved in this browser.', error);
  }
  updateWallet();
}
export function notify(message) {
  const element = document.getElementById('toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  window.clearTimeout(notify.timeout);
  notify.timeout = window.setTimeout(() => element.classList.remove('show'), 1800);
}

const panel = document.getElementById('game-panel');
const games = { fishing: initFishing, cooking: initCooking, cleaning: initCleaning };
let disposeCurrentGame = null;

document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.open;
    if (!games[name]) return;
    if (disposeCurrentGame) disposeCurrentGame();
    panel.replaceChildren();
    disposeCurrentGame = games[name](panel) || null;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
updateWallet();