import { state, save, notify } from './main.js';

const villagers = [
  { name: 'Pip', role: 'The little postbird', emoji: '🐧', lines: ['A new day means a new adventure!', 'I heard there are shiny fish by Sunny Pond.', 'Have you visited the flower garden today?'] },
  { name: 'Mochi', role: 'The village baker', emoji: '🐻', lines: ['The secret ingredient is always a little kindness.', 'I made fresh buns this morning. They smell amazing!', 'You should try making something in Mei Mei’s kitchen.'] },
  { name: 'Clover', role: 'The garden keeper', emoji: '🐰', lines: ['The flowers look extra happy today.', 'A cosy home is made one little detail at a time.', 'I love seeing everyone around the island.'] }
];
const dailyKey = 'mei-mei-cozy-daily';
const dayStamp = () => new Date().toLocaleDateString('en-CA');
const readDaily = () => {
  try {
    const value = JSON.parse(localStorage.getItem(dailyKey) || '{}');
    return value.date === dayStamp() ? value : { date: dayStamp(), claimed: false };
  } catch { return { date: dayStamp(), claimed: false }; }
};
let daily = readDaily();
let dialogueIndex = {};
let clockTimer;

function updateSky() {
  const now = new Date();
  const hour = now.getHours();
  const phase = hour < 6 ? '🌙 Night-time' : hour < 11 ? '🌅 Morning' : hour < 17 ? '☀️ Afternoon' : hour < 20 ? '🌇 Evening' : '🌙 Night-time';
  const clock = document.getElementById('island-clock');
  const sky = document.getElementById('sky-scene');
  if (clock) clock.textContent = phase + ' · ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (sky) sky.dataset.phase = hour < 6 || hour >= 20 ? 'night' : hour < 9 || hour >= 17 ? 'sunset' : 'day';
}
function renderDaily() {
  const root = document.getElementById('daily-board');
  if (!root) return;
  const tasks = [
    { label: 'Catch 3 fish', value: Math.min(3, state.totalFish), target: 3, emoji: '🎣' },
    { label: 'Cook 1 lovely meal', value: Math.min(1, state.totalMeals), target: 1, emoji: '🥧' },
    { label: 'Visit 3 island spots', value: Math.min(3, state.visited.length), target: 3, emoji: '🗺️' }
  ];
  const complete = tasks.every(task => task.value >= task.target);
  root.innerHTML = '<div class="daily-heading"><div><span class="eyebrow">A little something to do</span><h3>Today’s Island Requests</h3><p>Help out around the island and earn a bonus.</p></div><span class="daily-reward">🎁 +30 coins</span></div><div class="daily-tasks">' +
    tasks.map(task => '<div class="daily-task"><span>' + task.emoji + '</span><div><b>' + task.label + '</b><small>' + task.value + ' / ' + task.target + ' complete</small><div class="progress"><div style="width:' + (task.value / task.target * 100) + '%"></div></div></div></div>').join('') +
    '</div><button class="button" id="claim-daily" ' + (!complete || daily.claimed ? 'disabled' : '') + '>' + (daily.claimed ? 'Daily reward collected ✓' : complete ? 'Collect your 30 coins' : 'Keep exploring!') + '</button>';
  root.querySelector('#claim-daily').addEventListener('click', () => {
    if (!complete || daily.claimed) return;
    daily.claimed = true;
    localStorage.setItem(dailyKey, JSON.stringify(daily));
    state.coins += 30;
    save();
    renderDaily();
    notify('Daily island reward collected! +30 coins 🎁');
  });
}
function renderVillagers() {
  const root = document.getElementById('villager-board');
  if (!root) return;
  root.innerHTML = villagers.map((villager, index) => '<button class="villager-card" type="button" data-villager="' + index + '"><span class="villager-avatar">' + villager.emoji + '</span><b>' + villager.name + '</b><small>' + villager.role + '</small><span class="talk-hint">Say hello ♡</span></button>').join('');
  root.querySelectorAll('[data-villager]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.villager);
    const villager = villagers[index];
    const line = dialogueIndex[index] || 0;
    document.getElementById('villager-message').textContent = villager.emoji + ' ' + villager.name + ': “' + villager.lines[line % villager.lines.length] + '”';
    dialogueIndex[index] = line + 1;
  }));
}
export function initImmersion() {
  updateSky();
  renderVillagers();
  renderDaily();
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(updateSky, 30000);
  document.addEventListener('visibilitychange', updateSky);
  const originalSave = save;
  // Refresh the request board after each activity save without changing the shared save system.
  const refresh = () => renderDaily();
  window.addEventListener('mei-mei-progress', refresh);
}
