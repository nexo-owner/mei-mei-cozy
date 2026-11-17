import * as THREE from 'three';

export function startIsland({ onInteract, onClock } = {}) {
  const canvas = document.getElementById('world-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b9d9d8');
  scene.fog = new THREE.Fog('#c9e1d9', 32, 76);
  const camera = new THREE.PerspectiveCamera(39, window.innerWidth / window.innerHeight, .1, 150);
  const hemi = new THREE.HemisphereLight('#fff8e9', '#718d72', 2.05);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d4', 3.1);
  sun.position.set(-13, 24, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  Object.assign(sun.shadow.camera, { left: -23, right: 23, top: 23, bottom: -23 });
  sun.shadow.bias = -.00025;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#d7e9ff', .45);
  fill.position.set(10, 9, -14);
  scene.add(fill);

  const material = (color, roughness = 1, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const mats = {
    grass: material('#79ad83'), grassLight: material('#9bc997'), grassDark: material('#609775'),
    sand: material('#e9d6ad'), wood: material('#95694f'), woodLight: material('#bd906b'),
    cream: material('#fff0d6'), rose: material('#d48b87'), roof: material('#b97873'),
    leaf: material('#5d936e'), leafLight: material('#89b989'), leafPale: material('#a7c99a'),
    stone: material('#a9b5a2'), water: material('#78c2c7', .24, { metalness: .08 }),
    glass: material('#a8d5d5', .3, { metalness: .05 })
  };

  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), mats.water);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -1.18;
  scene.add(ocean);

  // A softly layered island gives the world a toy-diorama silhouette.
  const islandBase = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), material('#b69a70'));
  islandBase.scale.set(17.3, 2.15, 13.2);
  islandBase.position.y = -.28;
  islandBase.castShadow = true;
  islandBase.receiveShadow = true;
  scene.add(islandBase);
  const turf = new THREE.Mesh(new THREE.CircleGeometry(1, 96), mats.grass);
  turf.rotation.x = -Math.PI / 2;
  turf.scale.set(16.15, 12.25, 1);
  turf.position.y = .77;
  turf.receiveShadow = true;
  scene.add(turf);
  const lawn = new THREE.Mesh(new THREE.CircleGeometry(1, 96), mats.grassLight);
  lawn.rotation.x = -Math.PI / 2;
  lawn.scale.set(15.55, 11.65, 1);
  lawn.position.y = .785;
  lawn.receiveShadow = true;
  scene.add(lawn);

  function box(parent, w, h, d, mat, x, y, z, cast = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function path(points, width = 1.2) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, .805, z)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, width / 2, 9, false), mats.sand);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }
  path([[0, 9.5], [-.6, 6], [0, 3], [.6, 0], [0, -3], [0, -7.7]], 1.65);
  path([[0, 1], [3.2, 2], [6.5, 1], [9, -2]], 1.3);
  path([[0, -2.8], [-3.5, -3.5], [-7, -3], [-9.8, -.8]], 1.25);
  path([[1, 4], [4.5, 6], [8, 5]], 1.1);
  path([[-1, -1], [-3, 1], [-5, 2.4], [-7, 3]], .9);

  // Little homes with separate roofs, doors, windows and flower boxes.
  function house(x, z, wallColor, roofColor, scale = 1, rotation = 0) {
    const group = new THREE.Group();
    group.position.set(x, .8, z);
    group.rotation.y = rotation;
    group.scale.setScalar(scale);
    scene.add(group);
    const wall = material(wallColor);
    const roofMat = material(roofColor);
    box(group, 3.25, 2.25, 2.65, wall, 0, 1.15, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.55, 1.55, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.02;
    roof.castShadow = true;
    group.add(roof);
    box(group, .68, 1.3, .13, mats.wood, 0, .68, 1.38);
    box(group, .68, .68, .13, mats.glass, -1.02, 1.5, 1.37);
    box(group, .68, .68, .13, mats.glass, 1.02, 1.5, 1.37);
    box(group, .86, .12, .22, mats.cream, 0, 1.23, 1.5);
    box(group, .88, .16, .2, mats.woodLight, 0, .3, 1.47);
    for (const wx of [-1.02, 1.02]) {
      box(group, .76, .1, .18, mats.woodLight, wx, 1.12, 1.47);
      for (let i = 0; i < 3; i++) {
        const bloom = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), material(['#e9a6a0', '#f1d98f', '#f5e8db'][i]));
        bloom.position.set(wx - .22 + i * .22, 1.2, 1.55);
        group.add(bloom);
      }
    }
    const chimney = box(group, .38, .95, .4, mats.woodLight, 1.0, 3.25, -.5);
    chimney.rotation.z = -.12;
    return group;
  }
  house(-6.1, -5.1, '#f5e4ca', '#cf8981', 1.12, -.12);
  house(6.9, -4.7, '#f0e8d1', '#8ea987', .88, .15);
  house(8.1, 5.0, '#f0d8d0', '#c98682', .82, Math.PI);
  house(1.0, -6.2, '#f4e5c9', '#d4a66f', .72, -.1);

  // A little village square and fountain.
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(2.15, 48), mats.sand);
  plaza.rotation.x = -Math.PI / 2;
  plaza.scale.set(1.25, .9, 1);
  plaza.position.set(0, .81, 1.0);
  scene.add(plaza);
  const fountain = new THREE.Group();
  fountain.position.set(0, .84, 1.0);
  scene.add(fountain);
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.12, .28, 32), mats.cream);
  basin.position.y = .2;
  basin.castShadow = true;
  fountain.add(basin);
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(.88, .9, .08, 32), mats.water);
  pool.position.y = .37;
  fountain.add(pool);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.18, .26, .8, 12), mats.stone);
  pillar.position.y = .68;
  fountain.add(pillar);
  const fountainTop = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 12), mats.glass);
  fountainTop.position.y = 1.12;
  fountain.add(fountainTop);

  // Pond, stepping stones and a tiny wooden dock.
  const pond = new THREE.Mesh(new THREE.CircleGeometry(2.35, 56), mats.water);
  pond.rotation.x = -Math.PI / 2;
  pond.scale.set(1.25, .83, 1);
  pond.position.set(-7, .81, 3);
  scene.add(pond);
  const pondRim = new THREE.Mesh(new THREE.TorusGeometry(2.35, .2, 12, 56), mats.sand);
  pondRim.rotation.x = Math.PI / 2;
  pondRim.scale.set(1.25, .83, 1);
  pondRim.position.set(-7, .82, 3);
  scene.add(pondRim);
  const dock = new THREE.Group();
  dock.position.set(-4.8, .86, 3.0);
  dock.rotation.y = -.22;
  scene.add(dock);
  for (let i = 0; i < 4; i++) box(dock, .48, .14, 2.1, mats.woodLight, i * .48, 0, 0);
  for (const x of [0, 1.65]) for (const z of [-.8, .8]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .65, 8), mats.wood);
    post.position.set(x, -.25, z);
    dock.add(post);
  }

  // Trees are chunky, soft-edged 3D shapes, with little tufts and trunks.
  function tree(x, z, scale = 1, variant = 0) {
    const group = new THREE.Group();
    group.position.set(x, .79, z);
    group.scale.setScalar(scale);
    scene.add(group);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.17, .25, 1.35, 8), mats.wood);
    trunk.position.y = .66;
    trunk.castShadow = true;
    group.add(trunk);
    const palette = [mats.leaf, mats.leafLight, mats.leafPale];
    for (let i = 0; i < 4; i++) {
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.83 - i * .055, 2), palette[(variant + i) % palette.length]);
      crown.position.set((i % 2 ? .28 : -.25), 1.35 + (i % 3) * .34, (i % 2 ? -.12 : .12));
      crown.scale.set(1.05, 1.0, .95);
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
    }
    return group;
  }
  [[-12,-7],[-10,-5],[-12,0],[-11,6],[-6,8],[4,9],[10,8],[12,2],[11,-7],[3,-9],[-3,-9],[-13,3],[12,-2]].forEach(([x,z], i) => tree(x, z, .82 + (i % 3) * .12, i % 3));

  const flowerGroups = [];
  function flower(x, z, color, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, .8, z);
    group.scale.setScalar(scale);
    scene.add(group);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.025, .04, .36, 5), mats.leaf);
    stem.position.y = .18;
    group.add(stem);
    const centre = new THREE.Mesh(new THREE.SphereGeometry(.105, 10, 8), material('#e6bd65'));
    centre.position.y = .39;
    group.add(centre);
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(.105, 10, 8), material(color));
      const angle = i * Math.PI * 2 / 5;
      petal.position.set(Math.cos(angle) * .15, .4, Math.sin(angle) * .15);
      group.add(petal);
    }
    flowerGroups.push(group);
  }
  for (let i = 0; i < 125; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 6.8 + Math.random() * 7.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * .76;
    if (Math.abs(x) < 4 && Math.abs(z) < 4) continue;
    if (Math.hypot(x + 7, z - 3) < 3.3) continue;
    flower(x, z, ['#efb9b1', '#f1d98f', '#f6eee0', '#cbbde0'][i % 4], .75 + Math.random() * .45);
  }

  // Stone shoreline and little details make the island feel hand-built.
  for (let i = 0; i < 34; i++) {
    const angle = i / 34 * Math.PI * 2;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.27 + Math.random() * .28, 0), mats.stone);
    rock.position.set(Math.cos(angle) * 15.5, .61, Math.sin(angle) * 11.7);
    rock.scale.y = .7;
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    scene.add(rock);
  }
  function bench(x, z, rotation = 0) {
    const group = new THREE.Group();
    group.position.set(x, .82, z);
    group.rotation.y = rotation;
    scene.add(group);
    box(group, 1.35, .16, .42, mats.woodLight, 0, .62, 0);
    box(group, 1.35, .48, .13, mats.wood, 0, .94, -.15);
    for (const x0 of [-.48, .48]) box(group, .12, .6, .12, mats.wood, x0, .3, 0);
  }
  bench(3.8, 4.2, -.5);
  bench(-2.9, -1.0, .8);

  // Lanterns glow at dusk and give the paths a cosy scale.
  const lanternLights = [];
  function lantern(x, z) {
    const group = new THREE.Group();
    group.position.set(x, .8, z);
    scene.add(group);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.055, .075, 1.65, 8), mats.wood);
    pole.position.y = .82;
    group.add(pole);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(.42, .48, .42), material('#fff0bd', .35, { emissive: '#f0bd70', emissiveIntensity: .5 }));
    glass.position.y = 1.75;
    group.add(glass);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(.38, .3, 4), mats.wood);
    cap.position.y = 2.14;
    cap.rotation.y = Math.PI / 4;
    group.add(cap);
    const light = new THREE.PointLight('#ffdba1', .0, 7);
    light.position.y = 1.8;
    group.add(light);
    lanternLights.push(light);
  }
  [[-1,-3.5],[3,2.6],[6,-1.2],[-4,-2.8]].forEach(([x,z]) => lantern(x,z));

  // Clouds drift slowly overhead.
  const clouds = [];
  for (let i = 0; i < 6; i++) {
    const group = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(.65 + (j % 2) * .18, 14, 12), new THREE.MeshBasicMaterial({ color: '#fffaf0', transparent: true, opacity: .78 }));
      puff.position.set(j * .58, (j % 2) * .16, 0);
      group.add(puff);
    }
    group.position.set(-19 + i * 7, 10 + (i % 3), -14 - (i % 2) * 5);
    scene.add(group);
    clouds.push(group);
  }

  // Mei Mei and the neighbours are true 2D billboards inside the 3D scene.
  const textureLoader = new THREE.TextureLoader();
  const catTexture = textureLoader.load(new URL('../assets/images/mei-mei.svg', import.meta.url).href);
  catTexture.colorSpace = THREE.SRGBColorSpace;
  const catMaterial = new THREE.SpriteMaterial({ map: catTexture, transparent: true, depthWrite: false });
  const cat = new THREE.Sprite(catMaterial);
  cat.scale.set(1.9, 1.65, 1);
  cat.position.set(0, 1.72, 6);
  scene.add(cat);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.58, 28), new THREE.MeshBasicMaterial({ color: '#405c48', transparent: true, opacity: .22 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, .8, 6);
  scene.add(shadow);

  const neighbours = [];
  function neighbour(emoji, x, z, name) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 256;
    spriteCanvas.height = 320;
    const ctx = spriteCanvas.getContext('2d');
    ctx.font = '170px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 128, 142);
    ctx.font = 'bold 25px sans-serif';
    ctx.fillStyle = '#fffaf0';
    ctx.strokeStyle = '#61775c';
    ctx.lineWidth = 5;
    ctx.strokeText(name, 128, 280);
    ctx.fillText(name, 128, 280);
    const texture = new THREE.CanvasTexture(spriteCanvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
    sprite.scale.set(1.35, 1.7, 1);
    sprite.position.set(x, 1.65, z);
    scene.add(sprite);
    neighbours.push({ sprite, x, z });
  }
  neighbour('🐧', -2.4, 1.8, 'Pip');
  neighbour('🐻', 3.5, 3.1, 'Mochi');
  neighbour('🐰', 8.1, 5.3, 'Clover');

  function sign(x, z, label) {
    const group = new THREE.Group();
    group.position.set(x, .8, z);
    scene.add(group);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.055, .07, 1.05, 8), mats.wood);
    post.position.y = .52;
    group.add(post);
    box(group, 1.3, .43, .16, mats.cream, 0, 1.0, .02);
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 96;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#5d7156';
    ctx.font = 'bold 29px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 128, 59);
    const texture = new THREE.CanvasTexture(signCanvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true }));
    sprite.scale.set(1.08, .4, 1);
    sprite.position.set(0, 1.0, .12);
    group.add(sprite);
  }
  sign(-7, 5.2, 'POND');
  sign(-6, -7.0, 'COTTAGE');
  sign(7, -6.2, 'MARKET');
  sign(8, 6.8, 'GARDEN');
  sign(1, -8.0, 'BAKERY');

  const hotspots = [
    { id: 'fishing', label: 'Fish at Sunny Pond', x: -7, z: 3, r: 3.15 },
    { id: 'home', label: 'Visit your cottage', x: -6.1, z: -5.1, r: 2.5 },
    { id: 'cleaning', label: 'Tidy the cottage', x: -3.5, z: -5.1, r: 1.75 },
    { id: 'cooking', label: 'Cook something lovely', x: 1, z: -6.2, r: 2.2 },
    { id: 'shop', label: 'Visit the village market', x: 6.9, z: -4.7, r: 2.7 },
    { id: 'garden', label: 'Explore the flower garden', x: 8.1, z: 5, r: 2.8 },
    { id: 'journal', label: 'Chat with the neighbours', x: -2.4, z: 1.8, r: 1.8 },
    { id: 'journal', label: 'Chat with the neighbours', x: 3.5, z: 3.1, r: 1.8 },
    { id: 'journal', label: 'Chat with the neighbours', x: 8.1, z: 5.3, r: 1.8 }
  ];

  const keys = new Set();
  const touchKeys = new Set();
  let active = null;
  let started = false;
  let last = performance.now();
  let walk = 0;
  let clockLast = 0;
  let cameraAngle = 0;
  let dragging = false;
  let lastX = 0;
  const player = new THREE.Vector3(0, 0, 6);

  function inIsland(x, z) {
    return (x * x) / (14.5 * 14.5) + (z * z) / (10.8 * 10.8) < .94;
  }
  function interact() {
    if (started && active) onInteract?.(active.id);
  }
  function keydown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key) && started) event.preventDefault();
    keys.add(event.key.toLowerCase());
    if (event.key.toLowerCase() === 'e') interact();
    if (event.key === 'Escape' && started) document.getElementById('pause-button')?.click();
  }
  function keyup(event) { keys.delete(event.key.toLowerCase()); }
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  document.querySelectorAll('[data-move]').forEach(button => {
    const key = { up: 'w', down: 's', left: 'a', right: 'd' }[button.dataset.move];
    button.addEventListener('pointerdown', event => { event.preventDefault(); touchKeys.add(key); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => button.addEventListener(type, () => touchKeys.delete(key)));
  });
  document.getElementById('play-button')?.addEventListener('click', () => { started = true; });
  document.getElementById('interaction-hint')?.addEventListener('click', interact);
  canvas.addEventListener('pointerdown', event => { dragging = true; lastX = event.clientX; });
  window.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointermove', event => {
    if (dragging && started) {
      cameraAngle += (event.clientX - lastX) * .003;
      lastX = event.clientX;
    }
  });

  let animationFrame = 0;
  function frame(now) {
    animationFrame = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, .04);
    last = now;
    if (started) {
      let dx = 0, dz = 0;
      if (keys.has('w') || keys.has('arrowup') || touchKeys.has('w')) dz -= 1;
      if (keys.has('s') || keys.has('arrowdown') || touchKeys.has('s')) dz += 1;
      if (keys.has('a') || keys.has('arrowleft') || touchKeys.has('a')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright') || touchKeys.has('d')) dx += 1;
      const length = Math.hypot(dx, dz);
      if (length) {
        dx /= length;
        dz /= length;
        const cosine = Math.cos(cameraAngle), sine = Math.sin(cameraAngle);
        const moveX = dx * cosine + dz * sine;
        const moveZ = -dx * sine + dz * cosine;
        const nextX = player.x + moveX * 4.0 * dt;
        const nextZ = player.z + moveZ * 4.0 * dt;
        if (inIsland(nextX, nextZ)) { player.x = nextX; player.z = nextZ; }
        walk += dt * 10;
        cat.position.y = 1.72 + Math.abs(Math.sin(walk)) * .085;
        catMaterial.rotation = -moveX * .09;
      } else {
        cat.position.y = 1.72 + Math.sin(now * .0017) * .025;
        catMaterial.rotation = 0;
      }
      cat.position.x = player.x;
      cat.position.z = player.z;
      shadow.position.x = player.x;
      shadow.position.z = player.z;
    }

    const focus = new THREE.Vector3(player.x, 0, player.z);
    const offset = new THREE.Vector3(Math.sin(cameraAngle) * 12.7, 9.4, Math.cos(cameraAngle) * 14.6);
    camera.position.lerp(focus.clone().add(offset), 1 - Math.pow(.001, dt));
    camera.lookAt(player.x, .45, player.z - 1.1);

    active = null;
    let closest = Infinity;
    for (const hotspot of hotspots) {
      const distance = Math.hypot(player.x - hotspot.x, player.z - hotspot.z);
      if (distance < hotspot.r && distance < closest) { active = hotspot; closest = distance; }
    }
    const hint = document.getElementById('interaction-hint');
    if (hint) {
      hint.classList.toggle('hidden', !started || !active);
      if (active) document.getElementById('interaction-label').textContent = active.label;
    }
    neighbours.forEach(({ sprite, x, z }) => {
      sprite.material.rotation = Math.sin(now * .001 + x) * .018;
      sprite.position.y = 1.65 + Math.sin(now * .0018 + z) * .035;
    });
    clouds.forEach((cloud, index) => {
      cloud.position.x += dt * (.11 + index * .012);
      if (cloud.position.x > 23) cloud.position.x = -23;
    });
    flowerGroups.forEach((flower, index) => { flower.rotation.z = Math.sin(now * .0012 + index) * .025; });
    waterColor(now);

    const hour = new Date().getHours();
    const night = hour < 6 || hour >= 20;
    const sunset = hour >= 17 && hour < 20;
    sun.intensity = night ? .85 : sunset ? 2.0 : 3.1;
    hemi.intensity = night ? .95 : 2.05;
    fill.intensity = night ? .25 : .45;
    lanternLights.forEach(light => { light.intensity = night || sunset ? 1.5 : 0; });
    const sky = night ? '#8296aa' : sunset ? '#e6bba6' : '#c9e1d9';
    scene.fog.color.set(sky);
    scene.background.set(night ? '#8296aa' : sunset ? '#e4c1ad' : '#b9d9d8');
    if (now - clockLast > 15000) {
      clockLast = now;
      onClock?.(hour < 6 || hour >= 20 ? 'Quiet night' : hour < 11 ? 'Fresh morning' : hour < 17 ? 'Sunny afternoon' : 'Golden evening');
    }
    renderer.render(scene, camera);
  }
  function waterColor(now) {
    mats.water.color.setHSL(.51, .34, .59 + Math.sin(now * .0007) * .018);
  }
  camera.position.set(0, 11, 22);
  camera.lookAt(0, 0, 3);
  animationFrame = requestAnimationFrame(frame);
  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  };
  window.addEventListener('resize', resize);
  return {
    scene, camera, renderer,
    dispose() {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      renderer.dispose();
    }
  };
}
