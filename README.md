# Mei Mei's Cozy Island

A cosy, browser-based 2.5D adventure: a fully 3D island world with Mei Mei shown as a hand-drawn 2D character sprite.

## The experience
- A single illustrated main menu leading straight into a third-person island
- A 2D billboard character loaded from the original `assets/images/mei-mei.svg`, positioned with the bottom of the sprite aligned to the ground
- Custom 3D scene geometry for cottages, gabled roofs, windows, doors, trees, a pond, fountain, gazebo, flower beds, shoreline and winding paths
- Separate enterable interiors for Mei Mei's cottage, the shop, bakery kitchen, pond and flower garden
- Nearby interaction prompts, keyboard movement, click-to-walk and touch controls
- Island map, inventory bag, fishing, cooking, flower collecting, shopping and cottage decorating
- Graphics settings for Performance / Balanced / Beautiful, shadows, ambient sparkles and control hints
- Local browser save data

## Controls
- **WASD / Arrow keys:** Walk
- **E / Enter:** Interact with the nearest place
- **Escape:** Open settings
- **Click / tap the ground:** Move Mei Mei towards that point
- **Mobile:** Use the on-screen direction pad and heart interaction button
- **Map / Bag / Gear:** Open the island map, inventory and settings

## Graphics and performance
- **Performance:** lower pixel ratio, no antialiasing at startup and no real-time shadows
- **Balanced:** medium pixel ratio and optional shadows
- **Beautiful:** higher pixel ratio, antialiasing at startup and soft shadows
- Shadows and ambient sparkle particles can be toggled separately.

## Run
Serve the project with a local web server (VS Code Live Server, Python `http.server`, etc.) or publish it with GitHub Pages. The game imports Three.js as an ES module from jsDelivr, so an internet connection and WebGL support are required.

## Project structure
- `index.html`: game shell, HUD and main menu
- `css/game.css`: menus, HUD, overlays and responsive styling
- `js/game.js`: Three.js scene, character, movement, interiors, interactions and settings
- `assets/images/mei-mei.svg`: original 2D Mei Mei artwork used in the 3D world
- `js/main.js`, `js/world.js`, `js/games/`: earlier modular prototype retained in the repository
