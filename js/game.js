import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const $=id=>document.getElementById(id);
const SAVE='mei-mei-3d-save';
const defaults={coins:35,fish:0,meals:0,visited:[],items:['🪑 Wooden chair'],settings:{quality:'high',shadows:true,particles:true,showHints:true}};
let data;try{data={...defaults,...JSON.parse(localStorage.getItem(SAVE)||'{}')};data.settings={...defaults.settings,...(data.settings||{})}}catch{data={...defaults,settings:{...defaults.settings}}}
const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify(data))}catch{};updateHUD()};
function updateHUD(){$('coin-count').textContent=data.coins}
const locations=[
{id:'town',name:'Town Square',emoji:'⛲',desc:'Meet your neighbours and see what is happening.',pos:[0,0,0]},
{id:'cottage',name:"Mei Mei's Cottage",emoji:'🏡',desc:'Your real little home. Rest, decorate and get cosy.',pos:[-11,0,-9]},
{id:'shop',name:'Little Shop',emoji:'🛍️',desc:'Browse cute furniture and island essentials.',pos:[11,0,-9]},
{id:'pond',name:'Sunny Pond',emoji:'🎣',desc:'Relax by the water and catch fish.',pos:[-12,0,10]},
{id:'kitchen',name:'Bunny Bakery',emoji:'🥐',desc:'Cook something delicious with the neighbours.',pos:[11,0,10]},
{id:'garden',name:'Flower Garden',emoji:'🌷',desc:'Wander through flowers and collect petals.',pos:[0,0,15]}
];
let scene,camera,renderer,clock,player,playerShadow,characterTexture,sparkleField=null,keys={},nearby=null,currentPlace='island',inside=false,raf=0,toastTimer,modalOpen=false;
const interactables=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function makeCanvasTexture(draw,w=256,h=256){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');draw(ctx,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
function grassTexture(){return makeCanvasTexture((c,w,h)=>{c.fillStyle='#9fbd8d';c.fillRect(0,0,w,h);for(let i=0;i<1700;i++){c.fillStyle=['#b9cd9b','#88ae84','#d1d1a0','#91b58d'][Math.floor(Math.random()*4)];c.globalAlpha=.25+Math.random()*.4;c.beginPath();c.ellipse(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*2,Math.random()*3,0,Math.PI*2);c.fill()}c.globalAlpha=1},256,256)}
function pathTexture(){return makeCanvasTexture((c,w,h)=>{c.fillStyle='#e8d6b6';c.fillRect(0,0,w,h);for(let i=0;i<500;i++){c.fillStyle=Math.random()>.5?'#d7c29f':'#f5e6ca';c.globalAlpha=.3;c.beginPath();c.arc(Math.random()*w,Math.random()*h,Math.random()*3,0,7);c.fill()}c.globalAlpha=1})}
function plasterTexture(){return makeCanvasTexture((c,w,h)=>{c.fillStyle='#f5e7d6';c.fillRect(0,0,w,h);for(let i=0;i<950;i++){c.fillStyle=i%3?'#d9c7b4':'#fff7e9';c.globalAlpha=.08+Math.random()*.12;c.beginPath();c.arc(Math.random()*w,Math.random()*h,1+Math.random()*3,0,Math.PI*2);c.fill()}c.globalAlpha=1})}
function timberTexture(){return makeCanvasTexture((c,w,h)=>{c.fillStyle='#b88c69';c.fillRect(0,0,w,h);for(let i=0;i<55;i++){c.strokeStyle=i%2?'#8f684e':'#d7b18b';c.globalAlpha=.16;c.lineWidth=1+Math.random()*3;c.beginPath();const y=Math.random()*h;c.moveTo(0,y);c.bezierCurveTo(w*.3,y-8,w*.7,y+8,w,y+Math.random()*4);c.stroke()}c.globalAlpha=1})}
function shingleTexture(){return makeCanvasTexture((c,w,h)=>{c.fillStyle='#bd8584';c.fillRect(0,0,w,h);for(let y=0;y<h+24;y+=24){for(let x=-24;x<w+24;x+=32){c.fillStyle=['#d69a98','#b9787c','#c98a88'][Math.floor(Math.random()*3)];c.beginPath();c.arc(x+(y/24%2)*16,y,18,Math.PI,Math.PI*2);c.fill();c.strokeStyle='#9f6d70';c.globalAlpha=.32;c.stroke();c.globalAlpha=1}}})}
function mat(color,roughness=1){return new THREE.MeshStandardMaterial({color,roughness})}
function box(parent,x,y,z,sx,sy,sz,material){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(parent,x,y,z,r1,r2,h,material,segments=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function sphere(parent,x,y,z,r,material,sx=1,sy=1,sz=1){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function spriteTexture(){return makeCanvasTexture((c,w,h)=>{c.clearRect(0,0,w,h);c.save();c.translate(w/2,0);
 // soft outline and tiny shadow
 c.fillStyle='#00000018';c.beginPath();c.ellipse(0,245,49,9,0,0,Math.PI*2);c.fill();
 // tail behind body
 c.strokeStyle='#f5eee5';c.lineWidth=17;c.lineCap='round';c.beginPath();c.moveTo(28,177);c.bezierCurveTo(72,183,72,137,52,143);c.stroke();c.strokeStyle='#b58d79';c.lineWidth=3;c.stroke();
 // feet
 c.fillStyle='#e9b5aa';c.beginPath();c.ellipse(-22,230,19,12,0,0,Math.PI*2);c.ellipse(22,230,19,12,0,0,Math.PI*2);c.fill();
 // body
 c.fillStyle='#f5eee5';c.strokeStyle='#b58d79';c.lineWidth=4;c.beginPath();c.ellipse(0,177,44,60,0,0,Math.PI*2);c.fill();c.stroke();
 // jumper
 c.fillStyle='#d98f9b';c.beginPath();c.roundRect(-39,166,78,57,19);c.fill();c.stroke();
 c.fillStyle='#f8e7dc';for(let i=0;i<3;i++){c.beginPath();c.arc(0,181+i*12,2.5,0,7);c.fill()}
 // head
 c.fillStyle='#f5eee5';c.beginPath();c.ellipse(0,91,65,66,0,0,Math.PI*2);c.fill();c.stroke();
 // ears
 c.beginPath();c.moveTo(-52,54);c.lineTo(-54,4);c.quadraticCurveTo(-52,-10,-40,2);c.lineTo(-17,40);c.closePath();c.fill();c.stroke();
 c.beginPath();c.moveTo(52,54);c.lineTo(54,4);c.quadraticCurveTo(52,-10,40,2);c.lineTo(17,40);c.closePath();c.fill();c.stroke();
 c.fillStyle='#e9b1b2';c.beginPath();c.moveTo(-46,40);c.lineTo(-48,12);c.lineTo(-29,39);c.fill();c.beginPath();c.moveTo(46,40);c.lineTo(48,12);c.lineTo(29,39);c.fill();
 // face
 c.fillStyle='#58483f';c.beginPath();c.ellipse(-23,91,4,7,0,0,7);c.ellipse(23,91,4,7,0,0,7);c.fill();
 c.strokeStyle='#58483f';c.lineWidth=3;c.beginPath();c.moveTo(-5,108);c.quadraticCurveTo(0,114,5,108);c.stroke();
 c.fillStyle='#e9a2a1';c.beginPath();c.ellipse(-39,108,9,5,0,0,7);c.ellipse(39,108,9,5,0,0,7);c.fill();
 // flower hair clip
 c.fillStyle='#f5d68c';for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.beginPath();c.arc(-42+Math.cos(a)*10,58+Math.sin(a)*10,6,0,7);c.fill()}c.fillStyle='#d98f9b';c.beginPath();c.arc(-42,58,5,0,7);c.fill();
 c.restore()},128,256)}
function createCharacter(){
 const group=new THREE.Group();
 const material=new THREE.MeshBasicMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false});
 const sprite=new THREE.Mesh(new THREE.PlaneGeometry(2.45,2.45),material);
 // The bottom edge of the SVG plane sits at y=0, so Mei Mei's paws meet the ground.
 sprite.position.y=1.225;group.add(sprite);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.52,40),new THREE.MeshBasicMaterial({color:'#344a37',transparent:true,opacity:.22,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=.035;group.add(shadow);
 player=group;playerShadow=shadow;scene.add(player);
 const loader=new THREE.TextureLoader();
 loader.load('assets/images/mei-mei.svg',texture=>{
   texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   material.map=texture;material.needsUpdate=true;
 },undefined,error=>{console.warn('Could not load Mei Mei SVG; using fallback sprite.',error);material.map=spriteTexture();material.needsUpdate=true});
}
function tree(x,z,scale=1){
 const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);
 const bark=mat('#987052'),leaf1=mat('#7fa77e'),leaf2=mat('#9bbb8a'),leaf3=mat('#b5ca94');
 cylinder(g,0,.72,0,.19,.28,1.45,bark,12);
 // Layered rounded foliage gives the trees a sculpted, hand-painted silhouette.
 sphere(g,0,1.85,0,.93,leaf1,1,.9,.95);sphere(g,-.48,1.7,.05,.62,leaf2,1,.88,1);sphere(g,.48,1.72,-.08,.63,leaf1,1,.9,1);
 sphere(g,-.08,2.32,0,.63,leaf3,1,.85,1);sphere(g,.55,2.08,.08,.48,leaf2,1,.9,1);
 for(let i=0;i<3;i++)sphere(g,[-.4,.1,.48][i],1.98,[.3,-.5,.28][i],.09,mat('#e8d59a'));
 scene.add(g);
}
function flower(x,z,color){const g=new THREE.Group();g.position.set(x,0,z);cylinder(g,0,.17,0,.025,.03,.34,mat('#71976d'),7);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;sphere(g,Math.cos(a)*.11,.36,Math.sin(a)*.11,.11,mat(color),1,.7,1)}sphere(g,0,.36,0,.07,mat('#f4d27e'));scene.add(g)}
function cloud(x,y,z,s=1){const g=new THREE.Group();sphere(g,0,0,0,1,mat('#fffaf0'),1.2,.45,.55);sphere(g,-.65,-.08,0,.72,mat('#fffaf0'),1,.65,.6);sphere(g,.62,-.05,0,.75,mat('#fffaf0'),1,.65,.6);g.position.set(x,y,z);g.scale.setScalar(s);scene.add(g)}
function sign(x,z,label,emoji){const g=new THREE.Group();cylinder(g,0,.6,0,.07,.08,1.2,mat('#a77d5f'),8);const board=box(g,0,1.2,0,1.5,.55,.12,mat('#f4e5c9'));const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#fff4dc';ctx.fillRect(0,0,512,160);ctx.fillStyle='#6c5a4b';ctx.font='bold 46px sans-serif';ctx.textAlign='center';ctx.fillText(emoji+' '+label,256,100);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;board.material=new THREE.MeshBasicMaterial({map:texture});g.position.set(x,0,z);scene.add(g)}
function addBuilding(place){
 const [x,,z]=place.pos,g=new THREE.Group();g.position.set(x,0,z);
 const palette={
  cottage:{wall:'#f3d8c9',roof:'#c78387',trim:'#fff0df',door:'#9b6f61',window:'#b6d8d4'},
  shop:{wall:'#f0e0b8',roof:'#86a98b',trim:'#fff3d8',door:'#9b795c',window:'#b9d9d7'},
  kitchen:{wall:'#f2d7c9',roof:'#d69a80',trim:'#fff0df',door:'#9b6f61',window:'#b8d9d6'}
 }[place.id]||{wall:'#f0e0c9',roof:'#c88e88',trim:'#fff0df',door:'#9b6f61',window:'#b8d9d6'};
 const wallMat=new THREE.MeshStandardMaterial({color:palette.wall,map:plasterTexture(),roughness:1}),trimMat=mat(palette.trim),roofMat=new THREE.MeshStandardMaterial({color:palette.roof,map:shingleTexture(),roughness:1}),doorMat=new THREE.MeshStandardMaterial({color:palette.door,map:timberTexture(),roughness:1});
 // Soft-edged cottage body, built from a rounded extruded silhouette rather than a cube.
 const shape=new THREE.Shape();shape.moveTo(-2.05,.12);shape.lineTo(2.05,.12);shape.quadraticCurveTo(2.22,.12,2.22,.34);shape.lineTo(2.22,2.35);shape.quadraticCurveTo(2.22,2.56,2.02,2.56);shape.lineTo(-2.02,2.56);shape.quadraticCurveTo(-2.22,2.56,-2.22,2.35);shape.lineTo(-2.22,.34);shape.quadraticCurveTo(-2.22,.12,-2.05,.12);
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:3.35,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.07,bevelThickness:.07}),wallMat);body.position.z=-1.65;body.castShadow=true;body.receiveShadow=true;g.add(body);
 // Sculpted gable roof with visible eaves and a soft ridge.
 const roofShape=new THREE.Shape();roofShape.moveTo(-2.65,2.42);roofShape.lineTo(0,4.15);roofShape.lineTo(2.65,2.42);roofShape.lineTo(2.38,2.25);roofShape.lineTo(0,3.76);roofShape.lineTo(-2.38,2.25);roofShape.closePath();
 const roofMesh=new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape,{depth:3.8,bevelEnabled:true,bevelSegments:2,bevelSize:.06,bevelThickness:.06}),roofMat);roofMesh.position.z=-1.9;roofMesh.castShadow=true;g.add(roofMesh);
 // Front door, rounded transom and window frames.
 const doorShape=new THREE.Shape();doorShape.moveTo(-.48,.08);doorShape.lineTo(.48,.08);doorShape.lineTo(.48,1.48);doorShape.quadraticCurveTo(.48,1.95,0,1.95);doorShape.quadraticCurveTo(-.48,1.95,-.48,1.48);doorShape.closePath();
 const door=new THREE.Mesh(new THREE.ExtrudeGeometry(doorShape,{depth:.13,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:2}),doorMat);door.position.set(0,0,1.76);door.castShadow=true;g.add(door);
 sphere(g,.31,.94,1.94,.065,mat('#e9c878'));
 for(const wx of [-1.35,1.35]){
   const frame=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.12,32),trimMat);frame.rotation.x=Math.PI/2;frame.position.set(wx,1.65,1.77);g.add(frame);
   const pane=new THREE.Mesh(new THREE.CircleGeometry(.39,32),mat(palette.window));pane.position.set(wx,1.65,1.85);g.add(pane);
   box(g,wx,1.65,1.91,.055,.78,.05,trimMat);box(g,wx,1.65,1.92,.78,.055,.05,trimMat);
 }
 // Flower boxes and little stepping stones make the entrance feel lived-in.
 for(let i=0;i<5;i++){const a=-1.85+i*.23;sphere(g,a,.28,2.05,.15,mat(['#e7a3aa','#f3d78f','#f6eee0'][i%3]),1,.65,1)}
 for(let i=0;i<3;i++){const stone=new THREE.Mesh(new THREE.CylinderGeometry(.42,.48,.1,8),mat('#e8d6bd'));stone.position.set((i-1)*.62,.03,2.5+i*.45);stone.rotation.y=.2*i;g.add(stone)}
 scene.add(g);sign(x,z+3.1,place.name,place.emoji);
 interactables.push({place,position:new THREE.Vector3(x,0,z+3.6)});
}
function addLighting(){scene.add(new THREE.HemisphereLight('#fff4df','#8caa89',2));const sun=new THREE.DirectionalLight('#fff1d6',2.1);sun.position.set(-12,24,14);sun.castShadow=true;sun.shadow.mapSize.set(data.settings.quality==='high'?2048:1024,data.settings.quality==='high'?2048:1024);sun.shadow.camera.left=-32;sun.shadow.camera.right=32;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;scene.add(sun)}
function setupIsland(){
 sparkleField=null;
 scene.background=new THREE.Color('#b8d7d1');scene.fog=new THREE.Fog('#b8d7d1',42,100);
 const ocean=new THREE.Mesh(new THREE.CircleGeometry(110,96),new THREE.MeshStandardMaterial({color:'#83c2c5',roughness:.3,metalness:.05}));ocean.rotation.x=-Math.PI/2;ocean.position.y=-.42;scene.add(ocean);
 const ground=new THREE.Mesh(new THREE.CircleGeometry(34,96),new THREE.MeshStandardMaterial({map:grassTexture(),roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
 const beach=new THREE.Mesh(new THREE.RingGeometry(32.8,35,96),mat('#e8d5b1'));beach.rotation.x=-Math.PI/2;beach.position.y=-.13;scene.add(beach);
 const foam=new THREE.Mesh(new THREE.RingGeometry(34.8,35.35,96),new THREE.MeshBasicMaterial({color:'#e7f4e9',transparent:true,opacity:.65,side:THREE.DoubleSide}));foam.rotation.x=-Math.PI/2;foam.position.y=-.18;scene.add(foam);
 const pathMat=new THREE.MeshStandardMaterial({map:pathTexture(),roughness:1});
 const makePath=points=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],.025,p[1])));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,90,1.05,8,false),pathMat);mesh.scale.y=.12;mesh.receiveShadow=true;scene.add(mesh)};
 makePath([[0,18],[0,12],[-2,7],[0,2],[4,-2],[8,-6],[11,-9]]);
 makePath([[0,3],[-4,4],[-8,6],[-12,9],[-12,14]]);
 makePath([[0,3],[-4,0],[-7,-4],[-10,-8],[-11,-10]]);
 // Little stepping stones branch from the paths to each doorway.
 for(const [x,z] of [[-11,-5],[11,-5],[-12,6],[11,7],[0,13]])for(let i=0;i<3;i++){const stone=new THREE.Mesh(new THREE.CylinderGeometry(.48,.56,.1,9),mat('#e6d3b9'));stone.position.set(x+(Math.random()-.5)*.35,.02,z+i*.7);stone.rotation.y=Math.random();scene.add(stone)}
 const water=new THREE.Mesh(new THREE.CircleGeometry(4,64),new THREE.MeshStandardMaterial({color:'#91cdd0',roughness:.22,metalness:.04}));water.rotation.x=-Math.PI/2;water.scale.set(1.2,.76,1);water.position.set(-12,.04,10);scene.add(water);
 const pondRing=new THREE.Mesh(new THREE.RingGeometry(4.05,4.42,64),mat('#d9c59f'));pondRing.rotation.x=-Math.PI/2;pondRing.scale.set(1.2,.76,1);pondRing.position.set(-12,.055,10);scene.add(pondRing);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;flower(-12+Math.cos(a)*5,10+Math.sin(a)*3.5,['#f6d9a1','#e9a6ad','#fff1d3'][i%3])}
 for(let i=0;i<46;i++){const a=i/46*Math.PI*2,r=25+Math.sin(i*8)*2;tree(Math.cos(a)*r,Math.sin(a)*r,.8+Math.random()*.5)}
 [[-19,-8],[-20,0],[-18,17],[19,-3],[20,13],[17,19],[4,-21],[-5,-22]].forEach(([x,z])=>tree(x,z,1.1));
 for(let i=0;i<95;i++){const x=(Math.random()-.5)*45,z=(Math.random()-.5)*45;if(Math.abs(x)<3||Math.abs(z)<2||Math.hypot(x,z)>23)continue;flower(x,z,['#f4c8c6','#f4df9c','#fff0d7','#d8c9e9'][i%4])}
 locations.filter(p=>p.id!=='town'&&p.id!=='garden'&&p.id!=='pond').forEach(addBuilding);
 // Fishing hut beside the pond and a garden pergola make every destination recognisable.
 const hut={id:'pond',name:'Sunny Pond',emoji:'🎣',pos:[-17,0,10]};addBuilding(hut);
 const gazebo=new THREE.Group();gazebo.position.set(0,0,15);cylinder(gazebo,0,.15,0,2.5,2.5,.3,mat('#dfc8a7'),32);
 for(let i=0;i<4;i++){const a=i*Math.PI/2;const post=cylinder(gazebo,Math.cos(a)*1.7,1.3,Math.sin(a)*1.7,.075,.1,2.6,mat('#fff0d7'),10);post.rotation.z=-Math.cos(a)*.08}
 const roofShape=new THREE.Shape();roofShape.moveTo(-2.6,2.5);roofShape.lineTo(0,3.8);roofShape.lineTo(2.6,2.5);roofShape.lineTo(2.25,2.32);roofShape.lineTo(0,3.42);roofShape.lineTo(-2.25,2.32);roofShape.closePath();const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape,{depth:2.7,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:2}),mat('#d9959c'));roof.position.z=-1.35;gazebo.add(roof);scene.add(gazebo);sign(0,18,'Flower Garden','🌷');
 cylinder(scene,0,.2,0,2.1,2.1,.4,mat('#e6d5bd'),32);cylinder(scene,0,.55,0,.55,.7,.45,mat('#b4d4cf'),24);sphere(scene,0,1.1,0,.35,mat('#9ccfcb'),1,.55,1);
 // Scattered pebbles, mushrooms and shrubs add scale and texture to the meadow.
 for(let i=0;i<24;i++){const x=(Math.random()-.5)*42,z=(Math.random()-.5)*42;if(Math.hypot(x,z)>24)continue;const rock=sphere(scene,x,.12,z,.22,mat('#d4c9b2'),1.3,.55,1);rock.rotation.y=Math.random()*Math.PI}
 cloud(-18,17,-25,2.4);cloud(15,20,-27,2.8);
 // Tiny floating pollen motes catch the sunlight. They are optional in graphics settings.
 if(data.settings.particles){const positions=new Float32Array(120*3);for(let i=0;i<120;i++){positions[i*3]=(Math.random()-.5)*42;positions[i*3+1]=.6+Math.random()*5;positions[i*3+2]=(Math.random()-.5)*42}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));sparkleField=new THREE.Points(geometry,new THREE.PointsMaterial({color:'#fff0b8',size:.13,transparent:true,opacity:.75,depthWrite:false}));scene.add(sparkleField)}
}
function setupRoom(id){
 addLighting();inside=true;currentPlace=id;scene.background=new THREE.Color('#e9d9cb');scene.fog=new THREE.Fog('#e9d9cb',24,55);
 const floorMat=new THREE.MeshStandardMaterial({color:id==='cottage'?'#c99e7b':'#d5b493',map:timberTexture(),roughness:1}),wallmat=new THREE.MeshStandardMaterial({color:id==='cottage'?'#f4e3d4':'#f5ecdc',map:plasterTexture(),roughness:1}),trim=mat('#fff0df');
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(25,21),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.03;floor.receiveShadow=true;scene.add(floor);
 // Three warm plaster walls with timber trim and high rounded windows.
 box(scene,0,3,-10.3,25,6,.35,wallmat);box(scene,-12.4,3,0,.35,6,21,wallmat);box(scene,12.4,3,0,.35,6,21,wallmat);
 for(const x of [-8,-4,0,4,8])box(scene,x,.12,-10.08,.09,5.65,.08,trim);
 box(scene,0,5.95,0,25,.18,21,mat('#b9827c'));
 const rug=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.5,.08,48),mat(id==='cottage'?'#d9959b':'#a8c4a0'));rug.position.set(0,.03,1);scene.add(rug);
 const tableTop=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,.18,32),mat('#c89a73'));tableTop.position.set(0,.95,-1);scene.add(tableTop);
 cylinder(scene,0,.48,-1,.16,.2,.9,mat('#a77e5d'),12);
 for(const x of [-.75,.75])for(const z of [-1.65,-.35])box(scene,x,.42,z,.13,.8,.13,mat('#a77e5d'));
 if(id==='cottage'){
   // Sofa, bed, bookcase, bedside lamp and a real little hearth.
   const sofa=mat('#d99ca0');box(scene,-6,.7,-6,3.8,1.1,1.35,sofa);box(scene,-6,1.35,-6.45,3.8,1.1,.35,sofa);for(const x of [-7.5,-4.5])box(scene,x,.95,-6,.35,1.2,1.5,mat('#c98a91'));
   box(scene,6,.55,-6,3.4,.85,2.4,mat('#e9d5b8'));box(scene,6,1.05,-6,3.3,.2,2.3,mat('#fff0dc'));box(scene,5,1.25,-6,.9,.3,.75,mat('#e4c9d5'));
   for(let i=0;i<4;i++){box(scene,-9+i*.45,1.4,-9,.3,2.4,.25,mat('#9d795f'))}
   box(scene,9,1.2,-7,1.8,2.4,.5,mat('#c58b79'));sphere(scene,9,2.55,-7,.55,mat('#f3d28a'));
 }else if(id==='shop'){
   for(let i=0;i<4;i++){const x=-8+i*5.2;box(scene,x,.85,-5,2.3,1.5,.8,mat(['#e2b7ad','#c4d4b2','#e9d5a8','#c3d8dc'][i]));for(let j=0;j<3;j++)sphere(scene,x+(j-1)*.48,1.8,-5,.28,mat(['#d98f9b','#a8bd9f','#e7c783'][j]))}
 }else if(id==='kitchen'){
   box(scene,0,.8,-6,10,1.35,1.4,mat('#e8c1b0'));box(scene,0,1.55,-6,10,.16,1.5,mat('#fff0df'));
   for(let i=0;i<3;i++){box(scene,-7+i*7,2.5,-8,2.8,1.2,.35,mat('#c3d9d0'));sphere(scene,-7+i*7,1.9,-7.6,.5,mat('#d9959b'))}
   cylinder(scene,0,1.85,-5.1,.65,.65,.24,mat('#9baea0'),32);
 }else if(id==='pond'){
   const water=new THREE.Mesh(new THREE.CircleGeometry(4,48),new THREE.MeshStandardMaterial({color:'#8fc9ca',roughness:.2,metalness:.05}));water.rotation.x=-Math.PI/2;water.position.set(0,.06,-2);water.scale.set(1.2,.75,1);scene.add(water);
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2;flower(Math.cos(a)*5,.0+Math.sin(a)*3-2,['#f4c8c6','#f4df9c','#fff0d7'][i%3])}
 }else if(id==='garden'){
   for(let i=0;i<55;i++)flower((Math.random()-.5)*19,(Math.random()-.5)*15,['#f4c8c6','#f4df9c','#fff0d7','#d8c9e9'][i%4]);
   for(let i=0;i<3;i++){const arch=new THREE.Mesh(new THREE.TorusGeometry(2.2,.13,10,32,Math.PI),mat('#9bb68e'));arch.rotation.z=Math.PI;arch.position.set(-5+i*5,2.4,-5);scene.add(arch)}
 }else{
   box(scene,0,.8,-6,7,1.4,.7,mat('#d9b4a6'));
 }
 // Warm wall lamps and a clear exit arch.
 for(const x of [-10,10]){sphere(scene,x,3.7,-9.7,.24,mat('#f2d28b'));const light=new THREE.PointLight('#ffe3b0',.45,9);light.position.set(x,3.5,-8);scene.add(light)}
 const arch=new THREE.Mesh(new THREE.TorusGeometry(.72,.12,10,32,Math.PI),trim);arch.rotation.z=Math.PI;arch.position.set(0,2,9.6);scene.add(arch);
 sign(0,-9.2,locations.find(x=>x.id===id)?.name||'Cosy room','♡');
}
function enterLocation(id){const place=locations.find(x=>x.id===id);if(!place)return;if(id==='town'){showToast('You are already in the Town Square ♡');return}scene.clear();interactables.length=0;setupRoom(id);scene.add(player);player.position.set(0,0,2);addInteractionTargets();camera.position.set(0,7,12);$('location-label').textContent=place.name;data.visited=[...new Set([...data.visited,id])];save();closeModal();showToast('Welcome to '+place.name+' ♡');}
function leaveRoom(){scene.clear();interactables.length=0;inside=false;currentPlace='island';addLighting();setupIsland();scene.add(player);player.position.set(0,0,3);addInteractionTargets();$('location-label').textContent='Sunny Meadow';closeModal();showToast('Back to the island!')}
function addInteractionTargets(){if(inside){const place=locations.find(p=>p.id===currentPlace);if(place)interactables.push({place,position:new THREE.Vector3(0,0,-1)});interactables.push({place:{id:'exit',name:'Island',emoji:'🚪',desc:'Head back outside.'},position:new THREE.Vector3(0,0,7.5)});return}locations.forEach(p=>interactables.push({place:p,position:new THREE.Vector3(p.pos[0],0,p.pos[2]+(p.id==='pond'?0:2.8))}));}
function initScene(){scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,120);camera.position.set(0,10,16);renderer=new THREE.WebGLRenderer({canvas:$('game-canvas'),antialias:data.settings.quality!=='low',powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,qualityPixelRatio()));renderer.shadowMap.enabled=data.settings.shadows&&data.settings.quality!=='low';renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;addLighting();clock=new THREE.Clock();setupIsland();createCharacter();addInteractionTargets();window.addEventListener('resize',resize);}
function qualityPixelRatio(){return data.settings.quality==='low'?1:data.settings.quality==='medium'?Math.min(devicePixelRatio,1.5):Math.min(devicePixelRatio,2)}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(qualityPixelRatio())}
function applySettings(){if(!renderer)return;renderer.setPixelRatio(qualityPixelRatio());renderer.shadowMap.enabled=data.settings.shadows&&data.settings.quality!=='low';renderer.shadowMap.needsUpdate=true;if(sparkleField)sparkleField.visible=data.settings.particles;resize();$('world-tip').classList.toggle('hidden',!data.settings.showHints)}
function showToast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function openModal(title,content,kicker='ISLAND LIFE'){modalOpen=true;const root=$('modal-root');root.innerHTML='<div class="modal-backdrop"><section class="modal-card"><button class="modal-close" aria-label="Close">×</button><span class="modal-kicker">'+kicker+'</span><h2>'+title+'</h2>'+content+'</section></div>';root.querySelector('.modal-close').addEventListener('click',closeModal);root.querySelector('.modal-backdrop').addEventListener('click',e=>{if(e.target.classList.contains('modal-backdrop'))closeModal()});root.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>handleAction(b.dataset.action,b.dataset.value)))}
function closeModal(){modalOpen=false;$('modal-root').replaceChildren()}
function settingsContent(){return '<p class="modal-copy">Tune the island to your device. Changes apply immediately.</p><label class="settings-row"><span><b>Graphics quality</b><small>Performance is best for older devices; Beautiful adds detail.</small></span><select id="quality-select"><option value="low" '+(data.settings.quality==='low'?'selected':'')+'>Performance</option><option value="medium" '+(data.settings.quality==='medium'?'selected':'')+'>Balanced</option><option value="high" '+(data.settings.quality==='high'?'selected':'')+'>Beautiful</option></select></label><label class="settings-row"><span><b>Soft shadows</b><small>Disable for a smoother frame rate.</small></span><input id="shadow-toggle" class="toggle" type="checkbox" '+(data.settings.shadows?'checked':'')+'></label><label class="settings-row"><span><b>Island sparkles</b><small>Decorative particles and floating details.</small></span><input id="particle-toggle" class="toggle" type="checkbox" '+(data.settings.particles?'checked':'')+'></label><label class="settings-row"><span><b>Show control hints</b><small>Display movement and interaction tips.</small></span><input id="hint-toggle" class="toggle" type="checkbox" '+(data.settings.showHints?'checked':'')+'></label><div class="modal-actions"><button class="primary" data-action="settings-done">Done</button><button data-action="return-menu">Main menu</button><button data-action="reset-save">Reset saved progress</button></div>'}
function showSettings(){openModal('Island settings',settingsContent(),'YOUR GAME, YOUR WAY');$('quality-select').addEventListener('change',e=>{data.settings.quality=e.target.value;applySettings();save()});$('shadow-toggle').addEventListener('change',e=>{data.settings.shadows=e.target.checked;applySettings();save()});$('hint-toggle').addEventListener('change',e=>{data.settings.showHints=e.target.checked;$('world-tip').classList.toggle('hidden',!e.target.checked);save()});$('particle-toggle').addEventListener('change',e=>{data.settings.particles=e.target.checked;save();showToast(e.target.checked?'Island sparkles are on ✨':'Island sparkles are off')})}
function showMap(){openModal('Where shall we wander?','<p class="modal-copy">Pick a place on the island to visit. Your little world is waiting.</p><div class="map-grid">'+locations.map(p=>'<button class="map-place" data-action="travel" data-value="'+p.id+'"><span>'+p.emoji+'</span><b>'+p.name+'</b><small>'+p.desc+'</small></button>').join('')+'</div>','ISLAND MAP')}
function showBag(){const items=[['🐟','Fish',''+data.fish],['🥧','Meals',''+data.meals],['🪙','Cozy coins',''+data.coins],['🪑','Furniture',''+data.items.length],['🌷','Places visited',''+data.visited.length]];openModal('Mei Mei’s little bag','<p class="modal-copy">Everything you have collected on your adventures.</p><div class="bag-grid">'+items.map(x=>'<div class="bag-item"><span>'+x[0]+'</span><b>'+x[2]+'</b><br>'+x[1]+'</div>').join('')+'</div>','YOUR BELONGINGS')}
function showActivity(id){let title='',body='';if(id==='pond'){title='A peaceful fishing spot';body='<p class="modal-copy">The pond is sparkling. Cast your line and see who is swimming by.</p><div class="modal-actions"><button class="primary" data-action="fish">🎣 Cast a line</button></div>'}else if(id==='kitchen'){title='A little something to bake';body='<p class="modal-copy">Choose a treat to make in the bakery kitchen.</p><div class="map-grid"><button class="map-place" data-action="cook" data-value="🥞"><span>🥞</span><b>Pancakes</b><small>Fluffy and sweet</small></button><button class="map-place" data-action="cook" data-value="🍪"><span>🍪</span><b>Cookies</b><small>Fresh from the oven</small></button><button class="map-place" data-action="cook" data-value="🍲"><span>🍲</span><b>Soup</b><small>A cosy bowl</small></button></div>'}else if(id==='shop'){title='The little island shop';body='<p class="modal-copy">A few lovely things for your cottage. Choose something to bring home.</p><div class="map-grid">'+[['🪑','Wooden chair',20],['🪴','Potted plant',15],['🛋️','Peach sofa',40],['💡','Star lamp',25]].map(x=>'<button class="map-place" data-action="buy" data-value="'+x[1]+'|'+x[2]+'|'+x[0]+'"><span>'+x[0]+'</span><b>'+x[1]+'</b><small>🪙 '+x[2]+' coins</small></button>').join('')+'</div>'}else if(id==='garden'){title='Flower garden';body='<p class="modal-copy">The breeze rustles through the flowers. Pick a little bouquet to take home?</p><div class="modal-actions"><button class="primary" data-action="flower">🌷 Pick a flower</button></div>'}else if(id==='cottage'){title='Welcome home, Mei Mei';body='<p class="modal-copy">Your cottage is your own little corner of the island. Put your feet up, look around and make it yours.</p><div class="modal-actions"><button class="primary" data-action="rest">🫖 Have a cosy rest</button><button data-action="decorate">🪴 Arrange your home</button></div>'}else{title='Town Square';body='<p class="modal-copy">The heart of the island. Take a moment to enjoy the fountain and say hello to your neighbours.</p><div class="modal-actions"><button class="primary" data-action="chat">💬 Say hello</button></div>'}openModal(title,body,'A LITTLE ADVENTURE')}
function handleAction(action,value){if(action==='return-menu'){closeModal();$('game-hud').classList.add('hidden');$('mobile-controls').classList.add('hidden');$('world-tip').classList.add('hidden');$('main-menu').classList.remove('hidden');return}if(action==='settings-done'){closeModal();return}if(action==='travel'){if(value==='town'){closeModal();showToast('The fountain is just ahead ♡')}else enterLocation(value);return}if(action==='fish'){data.fish++;data.coins+=5;save();closeModal();showToast('You caught a little fish! +5 coins 🐟');return}if(action==='cook'){data.meals++;data.coins+=8;save();closeModal();showToast('Freshly made '+value+'! +8 coins');return}if(action==='buy'){const [name,cost,emoji]=value.split('|');const price=Number(cost);if(data.coins<price){showToast('Not quite enough coins yet!');return}data.coins-=price;data.items.push(emoji+' '+name);save();closeModal();showToast(name+' added to your bag!');return}if(action==='flower'){data.items.push('🌷 Flower bouquet');save();closeModal();showToast('A lovely bouquet for your home!');return}if(action==='rest'){closeModal();showToast('Mei Mei feels all refreshed. ♡');return}if(action==='decorate'){const owned=data.items.map((item,i)=>'<button class="map-place" data-action="place-item" data-value="'+i+'"><span>'+item.split(' ')[0]+'</span><b>'+item.substring(item.indexOf(' ')+1)+'</b><small>Place in your cottage</small></button>').join('');openModal('Make this place yours','<p class="modal-copy">Choose something from your bag to add to your cosy cottage.</p><div class="map-grid">'+(owned||'<p>Your bag is empty. Visit the shop first!</p>')+'</div>','COTTAGE DECORATING');return}if(action==='place-item'){const item=data.items[Number(value)];if(item){const emoji=item.split(' ')[0];const prop=sphere(scene,(Math.random()-.5)*7,.7,(Math.random()-.5)*5,.55,mat(emoji==='🌷'?'#d98f9b':'#d5b28e'));prop.scale.set(1.2,1.2,1.2);showToast(item+' placed in your cottage!');closeModal()}return}if(action==='chat'){closeModal();showToast('Pip says: “Lovely day for an adventure!”');return}if(action==='reset-save'){if(confirm('Reset all island progress? This cannot be undone.')){localStorage.removeItem(SAVE);location.reload()}return}}
function nearest(){let best=null,dist=999;for(const item of interactables){const d=player.position.distanceTo(item.position);if(d<4.5&&d<dist){best=item;dist=d}}return best}
function interact(){if(nearby){if(nearby.place.id==='exit'){leaveRoom();return}if(nearby.place.id==='town'){showActivity('town');return}if(nearby.place.id==='garden'&&inside){showActivity('garden');return}if(nearby.place.id==='pond'&&inside){showActivity('pond');return}if(nearby.place.id==='shop'&&inside){showActivity('shop');return}if(nearby.place.id==='kitchen'&&inside){showActivity('kitchen');return}if(nearby.place.id==='cottage'&&inside){showActivity('cottage');return}if(!inside&&nearby.place.id!=='town'){enterLocation(nearby.place.id);return}showActivity(nearby.place.id)}else if(inside){showToast('Wander around and make yourself at home ♡')}else showToast('Take a little stroll and explore!')}
function startGame(){ $('main-menu').classList.add('hidden');$('game-hud').classList.remove('hidden');$('world-tip').classList.toggle('hidden',!data.settings.showHints);$('mobile-controls').classList.remove('hidden');$('location-label').textContent='Sunny Meadow';player.position.set(0,0,3);updateHUD();showToast('Welcome to your island, Mei Mei! ♡')}
function animate(){raf=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(sparkleField&&sparkleField.visible)sparkleField.rotation.y+=dt*.025;if(player&&!modalOpen&&$('main-menu').classList.contains('hidden')){let x=0,z=0;if(keys.ArrowUp||keys.KeyW||keys.forward)z-=1;if(keys.ArrowDown||keys.KeyS||keys.back)z+=1;if(keys.ArrowLeft||keys.KeyA||keys.left)x-=1;if(keys.ArrowRight||keys.KeyD||keys.right)x+=1;const moving=x!==0||z!==0;if(moving){const len=Math.hypot(x,z);x/=len;z/=len;const speed=inside?5:6.3;player.position.x+=x*speed*dt;player.position.z+=z*speed*dt;player.position.x=clamp(player.position.x,inside?-9:-28,inside?9:28);player.position.z=clamp(player.position.z,inside?-8:-28,inside?8:28);player.children[0].position.y=1.225+Math.abs(Math.sin(performance.now()*.012))*.045;player.children[0].rotation.y=Math.atan2(x,z)}else player.children[0].position.y=1.225;player.children[0].quaternion.copy(camera.quaternion);playerShadow.scale.setScalar(moving?1.05:1);const target=new THREE.Vector3(player.position.x,0,player.position.z);const offset=new THREE.Vector3(0,inside?7:9,inside?11:14);camera.position.lerp(target.clone().add(offset),1-Math.pow(.001,dt));camera.lookAt(target.x,1.1,target.z);nearby=nearest();$('interaction-prompt').classList.toggle('hidden',!nearby);if(nearby)$('interaction-prompt').textContent='E  '+(nearby.place.id==='exit'?'Return to island':nearby.place.name); }renderer.render(scene,camera)}
function bind(){window.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE'||e.code==='Enter'){if(!$('main-menu').classList.contains('hidden'))return;interact()}if(e.code==='Escape'){if(modalOpen)closeModal();else showSettings()}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault()});window.addEventListener('keyup',e=>keys[e.code]=false);$('play-button').addEventListener('click',startGame);$('continue-button').addEventListener('click',startGame);$('menu-settings').addEventListener('click',showSettings);$('settings-button').addEventListener('click',showSettings);$('map-button').addEventListener('click',showMap);$('bag-button').addEventListener('click',showBag);$('mobile-interact').addEventListener('click',interact);document.querySelectorAll('[data-move]').forEach(b=>{const k=b.dataset.move;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false))});$('game-canvas').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;const rect=renderer.domElement.getBoundingClientRect();const mouse=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);const ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);const point=new THREE.Vector3();if(ray.ray.intersectPlane(ground,point)&&!modalOpen&&$('main-menu').classList.contains('hidden')){player.position.x=clamp(point.x,-25,25);player.position.z=clamp(point.z,-25,25)}})}
function boot(){initScene();bind();animate();$('loading-fill').style.width='100%';setTimeout(()=>$('loading-screen').style.opacity='0',250);setTimeout(()=>$('loading-screen').remove(),800);updateHUD();if(!data.visited.length)$('continue-button').textContent='Continue adventure';}
try{boot()}catch(err){console.error('Island failed to load:',err);$('loading-screen').innerHTML='<div class="loading-card"><h1>Oh crumbs!</h1><p>The island could not load. Please refresh and try again.</p><p style="font-size:10px">Check that WebGL is enabled and your browser is up to date.</p></div>'}
