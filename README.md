# Mei Mei's Cozy Corner

A small, cozy browser game collection featuring fishing, cooking and cleaning.

## Project structure

- `index.html` — page structure and game entry point
- `css/style.css` — all visual styles and responsive layout
- `js/main.js` — app startup, shared state, save data and navigation
- `js/games/fishing.js` — fishing game
- `js/games/cooking.js` — recipe and cooking game
- `js/games/cleaning.js` — cottage cleaning game
- `assets/images/` — illustrations and image assets

## Run locally

Because the JavaScript uses ES modules, run this project through a local web server (for example, VS Code Live Server) rather than opening `index.html` directly.

Progress and cozy coins are saved in the browser using localStorage.
