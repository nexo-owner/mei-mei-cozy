import { state, save } from '../main.js';

const fish = [
  { emoji: '🐟', name: 'Little blue fish', coins: 2 },
  { emoji: '🐠', name: 'Sunny fish', coins: 3 },
  { emoji: '🐡', name: 'Puffy pufferfish', coins: 4 },
  { emoji: '🦀', name: 'Tiny crab', coins: 5 },
  { emoji: '🐬', name: 'Lucky dolphin', coins: 8 }
];

export function initFishing(root) {
  let caught = 0;
  let timer = null;
  const collection = new Set();
  root.innerHTML = `
    <div class="activity">
      <div class="activity-head"><h3>🎣 Fishing by the Pond</h3><span class="stat">🐟 Caught: <b id="caught">0</b></span></div>
      <div class="scene"><div class="scene-cat">🐱</div><h3>A lovely day for fishing!</h3><p>Tap the fish swimming in the pond. Some are rarer than others!</p><div class="pond" id="pond"></div></div>
      <div class="actions"><button id="start">🎣 Start fishing</button><button id="pause">Take a little break</button></div>
      <p class="message" id="msg">Mei Mei has her tiny fishing hat ready.</p>
      <p class="collection" id="collection">Today's collection: nothing caught yet</p>
    </div>`;
  const pond = root.querySelector('#pond');
  const message = root.querySelector('#msg');
  const stop = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };
  function spawnFish() {
    pond.replaceChildren();
    for (let i = 0; i < 4; i++) {
      const item = fish[Math.floor(Math.random() * fish.length)];
      const button = document.createElement('button');
      button.className = 'fish';
      button.type = 'button';
      button.textContent = item.emoji;
      button.style.left = (5 + Math.random() * 82) + '%';
      button.style.top = (10 + Math.random() * 65) + '%';
      button.setAttribute('aria-label', 'Catch ' + item.name);
      button.addEventListener('click', () => {
        caught++;
        collection.add(item.name);
        state.totalFish++;
        state.coins += item.coins;
        root.querySelector('#caught').textContent = caught;
        root.querySelector('#collection').textContent = "Today's collection: " + [...collection].join(' · ');
        message.textContent = 'You caught ' + item.name + '! +' + item.coins + ' cozy coins';
        save();
        button.remove();
      }, { once: true });
      pond.append(button);
    }
  }
  root.querySelector('#start').addEventListener('click', () => {
    stop();
    message.textContent = 'The fish are swimming around. Tap one to catch it!';
    spawnFish();
    timer = window.setInterval(spawnFish, 1900);
  });
  root.querySelector('#pause').addEventListener('click', () => {
    stop();
    message.textContent = 'A peaceful little break. Start again whenever you like.';
  });
  root.querySelector('#start').click();
  return stop;
}