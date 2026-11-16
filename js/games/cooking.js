import { state, save, notify } from '../main.js';

const recipes = [
  { name: 'Fish soup', items: ['fish', 'carrot', 'water'], emoji: '🍲', hint: 'A warm bowl of fish soup.' },
  { name: 'Cheesy toast', items: ['bread', 'cheese'], emoji: '🧀', hint: 'Golden, gooey cheesy toast.' },
  { name: 'Pancakes', items: ['egg', 'milk', 'flour', 'butter'], emoji: '🥞', hint: 'Fluffy little breakfast pancakes.' }
];
const ingredients = [
  ['fish', '🐟', 'Fish'], ['carrot', '🥕', 'Carrot'], ['water', '💧', 'Water'],
  ['bread', '🍞', 'Bread'], ['cheese', '🧀', 'Cheese'], ['egg', '🥚', 'Egg'],
  ['milk', '🥛', 'Milk'], ['flour', '🌾', 'Flour'], ['butter', '🧈', 'Butter']
];

export function initCooking(root) {
  let recipeIndex = 0;
  const selected = new Set();
  root.innerHTML = `
    <div class="activity">
      <div class="activity-head"><h3>🍳 Mei Mei's Cozy Kitchen</h3><span class="stat">🍲 Meals made: <b id="meals">${state.totalMeals}</b></span></div>
      <div class="recipe-tabs">${recipes.map((recipe, index) => `<button type="button" data-recipe="${index}">${recipe.emoji} ${recipe.name}</button>`).join('')}</div>
      <div class="recipe-layout">
        <div class="pot-scene"><div style="text-align:center"><div class="pot" id="pot">🍲</div><b id="recipeName"></b><p class="message" id="hint"></p></div></div>
        <div><h3>Ingredient basket</h3><p class="collection">Choose the ingredients in the recipe.</p><div class="ingredients">${ingredients.map(([id, emoji, name]) => `<button type="button" class="ingredient" data-item="${id}"><span>${emoji}</span>${name}</button>`).join('')}</div></div>
      </div>
      <p class="message" id="msg">Mei Mei is ready to taste-test!</p>
      <div class="actions"><button type="button" id="cook">🍳 Cook this</button><button type="button" id="clear">Clear basket</button></div>
    </div>`;
  const $ = selector => root.querySelector(selector);
  function drawIngredients() {
    root.querySelectorAll('[data-item]').forEach(button => button.classList.toggle('selected', selected.has(button.dataset.item)));
  }
  function renderRecipe() {
    const recipe = recipes[recipeIndex];
    $('#recipeName').textContent = recipe.name;
    $('#hint').textContent = 'Recipe: ' + recipe.items.join(' + ');
    root.querySelectorAll('[data-recipe]').forEach(button => button.classList.toggle('active', Number(button.dataset.recipe) === recipeIndex));
    selected.clear();
    drawIngredients();
  }
  root.querySelectorAll('[data-recipe]').forEach(button => button.addEventListener('click', () => {
    recipeIndex = Number(button.dataset.recipe);
    renderRecipe();
    $('#msg').textContent = 'New recipe selected. Gather the ingredients!';
  }));
  root.querySelectorAll('[data-item]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.item;
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    drawIngredients();
  }));
  $('#clear').addEventListener('click', () => {
    selected.clear();
    drawIngredients();
    $('#msg').textContent = 'Basket cleared.';
  });
  $('#cook').addEventListener('click', () => {
    const recipe = recipes[recipeIndex];
    const correct = selected.size === recipe.items.length && recipe.items.every(item => selected.has(item));
    if (!correct) {
      $('#msg').textContent = 'Not quite the right ingredients. Check the recipe and try again ♡';
      return;
    }
    state.totalMeals++;
    state.coins += 10;
    $('#meals').textContent = state.totalMeals;
    $('#pot').textContent = recipe.emoji;
    $('#msg').textContent = 'Perfect! ' + recipe.hint + ' Mei Mei gives it five paws! +10 coins';
    selected.clear();
    drawIngredients();
    save();
    notify('A lovely meal made! +10 coins');
  });
  renderRecipe();
}