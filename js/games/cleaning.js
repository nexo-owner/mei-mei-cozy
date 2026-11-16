import { state, save, notify } from '../main.js';

const mess = ['🧦', '🧸', '📦', '🍃', '🥫', '📰', '🧶', '🫖', '🧹'];

export function initCleaning(root) {
  let cleaned = 0;
  root.innerHTML = `
    <div class="activity">
      <div class="activity-head"><h3>🧹 Cleaning the Cottage</h3><span class="stat">✨ Tidied: <b id="count">0</b>/9</span></div>
      <div class="clean-scene">
        <div class="scene-cat" style="text-align:center">🐱</div>
        <h3 style="text-align:center">A little mess, a lot of love</h3>
        <p style="text-align:center">Tap each messy spot to tidy it away. Let's make home lovely again!</p>
        <div class="progress"><div id="bar"></div></div>
        <div class="room">${mess.map((emoji, index) => `<button type="button" class="mess" data-index="${index}" aria-label="Tidy item">${emoji}</button>`).join('')}</div>
      </div>
      <p class="message" id="msg">Every little tidy makes a difference ♡</p>
      <div class="actions"><button type="button" id="reset">Reset the room</button></div>
    </div>`;
  const $ = selector => root.querySelector(selector);
  root.querySelectorAll('.mess').forEach(button => button.addEventListener('click', () => {
    if (button.classList.contains('done')) return;
    button.classList.add('done');
    button.textContent = '✨';
    cleaned++;
    state.coins += 2;
    $('#count').textContent = cleaned;
    $('#bar').style.width = (cleaned / mess.length * 100) + '%';
    if (cleaned === mess.length) {
      state.totalRooms++;
      $('#msg').textContent = 'The cottage is sparkling! Mei Mei is so proud. +18 coins';
      notify('Cottage all clean! ✨');
    } else {
      $('#msg').textContent = 'Lovely work! A little more sparkle. +2 coins';
    }
    save();
  }));
  $('#reset').addEventListener('click', () => {
    cleaned = 0;
    $('#count').textContent = '0';
    $('#bar').style.width = '0%';
    $('#msg').textContent = 'Every little tidy makes a difference ♡';
    root.querySelectorAll('.mess').forEach((button, index) => {
      button.classList.remove('done');
      button.textContent = mess[index];
    });
  });
}