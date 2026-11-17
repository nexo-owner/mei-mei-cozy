import { initFishing } from './games/fishing.js';
import { initCooking } from './games/cooking.js';
import { initCleaning } from './games/cleaning.js';
import { initWorld } from './world.js';
import { initImmersion } from './immersion.js';
import { startIsland } from './game3d.js';

const SAVE_KEY = 'mei-mei-cozy-save';
function readSave(){try{const v=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return{}}}
const saved=readSave();
const numberOrZero=v=>Number.isFinite(v)&&v>=0?v:0;
export const state={
 coins:numberOrZero(saved.coins),totalFish:numberOrZero(saved.totalFish),totalMeals:numberOrZero(saved.totalMeals),totalRooms:numberOrZero(saved.totalRooms),
 outfit:saved.outfit||{hat:'none',top:'default',accessory:'none'},owned:Array.isArray(saved.owned)?saved.owned:['starter-chair'],
 placed:Array.isArray(saved.placed)?saved.placed:['starter-chair'],visited:Array.isArray(saved.visited)?saved.visited:[]
};
export function updateWallet(){for(const[id,value]of Object.entries({coins:state.coins,totalFish:state.totalFish,totalMeals:state.totalMeals,totalRooms:state.totalRooms,furnitureCount:state.owned.length})){const el=document.getElementById(id);if(el)el.textContent=value}}
export function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch(error){console.warn('Could not save island progress.',error)}updateWallet();window.dispatchEvent(new Event('mei-mei-progress'))}
export function notify(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');window.clearTimeout(notify.timeout);notify.timeout=window.setTimeout(()=>el.classList.remove('show'),1800)}
const games={fishing:initFishing,cooking:initCooking,cleaning:initCleaning};
let disposeCurrentGame=null;
const modal=document.getElementById('modal-backdrop'),modalContent=document.getElementById('modal-content');
const modalTitles={fishing:['BY THE WATER','Sunny Pond'],cooking:['A LITTLE SOMETHING TO MAKE','Mei Mei’s Kitchen'],cleaning:['HOME SWEET HOME','Cottage Cleaning'],wardrobe:['A FRESH LITTLE LOOK','Mei Mei’s Wardrobe'],shop:['THE VILLAGE MARKET','The Little Shop'],home:['YOUR OWN LITTLE SPACE','Home Sweet Home'],journal:['YOUR ISLAND JOURNAL','Little Island Life']};
const panels={wardrobe:document.getElementById('wardrobe-panel'),shop:document.getElementById('shop-panel'),home:document.getElementById('home-panel'),journal:document.getElementById('daily-board')};
const originalParents=new Map();
function openPanel(name){
 const meta=modalTitles[name];if(!meta)return;
 if(disposeCurrentGame){disposeCurrentGame();disposeCurrentGame=null}
 modalContent.replaceChildren();
 const title=document.getElementById('modal-title'),kicker=document.getElementById('modal-kicker');
 kicker.textContent=meta[0];title.textContent=meta[1];
 let node;
 if(games[name]){
   const root=document.getElementById('game-panel');root.replaceChildren();disposeCurrentGame=games[name](root)||null;node=root;
 }else if(name==='journal'){
   const wrap=document.createElement('div');wrap.className='journal-wrap';
   const daily=panels.journal;const villagers=document.createElement('div');villagers.className='journal-neighbours';villagers.innerHTML='<h3>Island neighbours</h3><div id="journal-villagers"></div><p id="journal-talk">Choose a neighbour to say hello ♡</p>';
   wrap.append(daily,villagers);modalContent.append(wrap);
   const old=document.getElementById('villager-board');const clone=old.cloneNode(true);clone.id='journal-villager-board';document.getElementById('journal-villagers').append(clone);
   clone.querySelectorAll('[data-villager]').forEach(btn=>btn.addEventListener('click',()=>{const source=old.querySelector('[data-villager="'+btn.dataset.villager+'"]');if(source)source.click();document.getElementById('journal-talk').textContent=document.getElementById('villager-message').textContent}));
   modal.classList.remove('hidden');return;
 }else node=panels[name];
 if(node){if(!originalParents.has(node))originalParents.set(node,node.parentElement);modalContent.append(node)}
 modal.classList.remove('hidden');
}
function closePanel(){modal.classList.add('hidden');if(disposeCurrentGame){disposeCurrentGame();disposeCurrentGame=null}for(const[node,parent]of originalParents){if(parent&&!parent.contains(node))parent.append(node)}}
window.openIslandPanel=openPanel;
document.getElementById('modal-close').addEventListener('click',closePanel);
modal.addEventListener('click',e=>{if(e.target===modal)closePanel()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!modal.classList.contains('hidden'))closePanel();else document.getElementById('pause-button').click()}});
document.querySelectorAll('[data-panel]').forEach(btn=>btn.addEventListener('click',()=>openPanel(btn.dataset.panel)));
document.getElementById('journal-button').addEventListener('click',()=>openPanel('journal'));
initWorld();initImmersion();updateWallet();
document.getElementById('play-button').addEventListener('click',()=>{document.getElementById('main-menu').classList.add('menu-hidden');document.getElementById('game-hud').classList.remove('hidden');document.body.classList.add('playing');});
document.getElementById('pause-button').addEventListener('click',()=>document.getElementById('pause-menu').classList.remove('hidden'));
document.getElementById('resume-button').addEventListener('click',()=>document.getElementById('pause-menu').classList.add('hidden'));
document.getElementById('return-menu').addEventListener('click',()=>{document.getElementById('pause-menu').classList.add('hidden');document.getElementById('game-hud').classList.add('hidden');document.getElementById('main-menu').classList.remove('menu-hidden');document.body.classList.remove('playing')});
document.querySelectorAll('#legacy [data-open]').forEach(btn=>btn.addEventListener('click',()=>openPanel(btn.dataset.open)));
startIsland({onInteract:openPanel,onClock:value=>{const el=document.getElementById('world-time');if(el)el.textContent=value}});
