# Mei Mei's Cozy Island

A cosy browser game built as a stylised 3D island with a hand-drawn 2D character.

## Game experience
- Main menu with Play, Continue and Settings
- Third-person exploration of a small 3D island
- 2D cartoon Mei Mei sprite that stays grounded in the 3D world
- Enterable cottage, furniture shop, bakery kitchen, pond room and flower garden
- Fishing, cooking, shopping, collecting and cottage decorating interactions
- Island map, inventory bag, keyboard controls and mobile touch controls
- Graphics quality, shadow and control-hint settings
- Local browser save data

## Controls
- **WASD / Arrow keys:** Walk
- **E / Enter:** Interact with a nearby place
- **Escape:** Open settings
- **Mobile:** Use the on-screen direction pad and heart interaction button
- **Map / Bag / Gear:** Open the map, inventory and settings

## Run
Serve the repository with a local web server or GitHub Pages. The game uses Three.js as an ES module from jsDelivr, so it needs an internet connection and WebGL support.

## Performance
Choose Performance, Balanced or Beautiful in Settings. Shadows can be disabled separately. Performance mode reduces pixel ratio and disables antialiasing and shadows.

## Project structure
- `index.html`: game shell and main menu
- `css/game.css`: game HUD, menus, overlays and responsive styling
- `js/game.js`: Three.js world, 2D character, controls, rooms, interactions and save system
- `js/` and `css/`: earlier modular prototype files retained for reference
- `assets/images/`: original character artwork
