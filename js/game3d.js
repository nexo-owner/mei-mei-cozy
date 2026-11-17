import * as THREE from 'three';
export function startIsland({onInteract,onClock}={}){
 const canvas=document.getElementById('world-canvas');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b9d8d5');scene.fog=new THREE.Fog('#c7ded7',28,70);
 const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,120);
 const hemi=new THREE.HemisphereLight('#fff7df','#718c70',2.0);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff0d4',3.0);sun.position.set(-12,22,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.bias=-.00025;scene.add(sun);
 const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
 const grass=mat('#83b68d'),grass2=mat('#9bc99a'),sand=mat('#e6d2a9'),wood=mat('#a97658'),cream=mat('#fff1d7'),pink=mat('#d99191'),roof=mat('#bd7777'),leaf=mat('#679b76'),leaf2=mat('#8bb88b'),water= new THREE.MeshStandardMaterial({color:'#78bfc3',roughness:.28,metalness:.05});
 const ocean=new THREE.Mesh(new THREE.PlaneGeometry(200,200),water);ocean.rotation.x=-Math.PI/2;ocean.position.y=-1.1;scene.add(ocean);
 const island=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),grass);island.scale.set(17,2.0,13);island.position.y=-.2;island.receiveShadow=true;island.castShadow=true;scene.add(island);
 const top=new THREE.Mesh(new THREE.CircleGeometry(1,64),grass2);top.rotation.x=-Math.PI/2;top.scale.set(15.9,12.1,1);top.position.y=.72;top.receiveShadow=true;scene.add(top);
 const ground=new THREE.Mesh(new THREE.CircleGeometry(1,64),grass);ground.rotation.x=-Math.PI/2;ground.scale.set(15.7,11.9,1);ground.position.y=.735;ground.receiveShadow=true;scene.add(ground);
 // soft sandy paths
 function path(points,width=1.35){const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.77,z)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,90,width/2,8,false),sand);mesh.position.y=.02;mesh.receiveShadow=true;scene.add(mesh)}
 path([[-1,9],[-1,6],[0,3],[1,0],[0,-3],[0,-7]],1.65);path([[0,1],[4,2],[7,1],[9,-2]],1.3);path([[0,-3],[-4,-4],[-8,-3],[-10,-1]],1.2);path([[1,4],[5,6],[8,5]],1.1);
 function box(parent,w,h,d,material,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function house(x,z,wall,roofColor,scale=1){const g=new THREE.Group();g.position.set(x,.8,z);g.scale.setScalar(scale);scene.add(g);box(g,3.5,2.3,2.8,mat(wall),0,1.2,0);const r=new THREE.Mesh(new THREE.ConeGeometry(2.65,1.5,4),mat(roofColor));r.rotation.y=Math.PI/4;r.position.set(0,3.0,0);r.castShadow=true;g.add(r);box(g,.72,1.35,.12,wood,0,.72,1.43);box(g,.7,.65,.13,mat('#a8c9c4'),-1.05,1.55,1.45);box(g,.7,.65,.13,mat('#a8c9c4'),1.05,1.55,1.45);box(g,.82,.12,.2,cream,0,1.4,1.55);return g}
 house(-6,-5,'#f4dfc2','#d58d83',1.15);house(7,-4,'#f3e8cf','#9caf91',.85);house(8,5,'#f1d8d1','#c98683',.8);house(1,-5.5,'#f4e4c8','#d5a66f',.72);
 // pond
 const pond=new THREE.Mesh(new THREE.CircleGeometry(2.45,48),water);pond.rotation.x=-Math.PI/2;pond.scale.set(1.25,.8,1);pond.position.set(-7,.79,3);scene.add(pond);
 const pondEdge=new THREE.Mesh(new THREE.TorusGeometry(2.45,.22,12,48),sand);pondEdge.rotation.x=Math.PI/2;pondEdge.scale.set(1.25,.8,1);pondEdge.position.set(-7,.8,3);scene.add(pondEdge);
 // trees and flowers
 const trunk=mat('#8d684f'),petals=[mat('#f2c4c0'),mat('#f4df9e'),mat('#eee8dc'),mat('#cbbbe2')];
 function tree(x,z,s=1){const g=new THREE.Group();g.position.set(x,.8,z);scene.add(g);const t=new THREE.Mesh(new THREE.CylinderGeometry(.16*s,.24*s,1.5*s,8),trunk);t.position.y=.75*s;t.castShadow=true;g.add(t);for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry((1.0-i*.12)*s,2),i===1?leaf2:leaf);crown.position.set((i-1)*.38*s,(1.75+i*.34)*s,0);crown.castShadow=true;crown.receiveShadow=true;g.add(crown)}}
 [[-12,-7],[-10,-5],[-12,0],[-11,6],[-6,8],[4,9],[10,8],[12,2],[11,-7],[3,-9],[-3,-9]].forEach(([x,z],i)=>tree(x,z,.8+(i%3)*.13));
 function flower(x,z,color){const g=new THREE.Group();g.position.set(x,.79,z);scene.add(g);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,.34,5),leaf);stem.position.y=.17;g.add(stem);const c=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),mat(color));c.position.y=.39;g.add(c);for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.105,10,8),petals[i%petals.length]);const a=i*Math.PI*2/5;p.position.set(Math.cos(a)*.16,.4,Math.sin(a)*.16);g.add(p)}}
 for(let i=0;i<100;i++){const a=Math.random()*Math.PI*2,r=7+Math.random()*7,x=Math.cos(a)*r,z=Math.sin(a)*r*.76;if(Math.abs(x)<4&&Math.abs(z)<4)continue;flower(x,z,['#f2c4c0','#f4df9e','#eee8dc','#cbbbe2'][i%4])}
 // rocks along shore
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=Math.cos(a)*15,z=Math.sin(a)*11.3;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.35+Math.random()*.35,0),mat('#a9b5a2'));rock.position.set(x,.65,z);rock.scale.y=.7;rock.castShadow=true;scene.add(rock)}
 // clouds
 const clouds=[];for(let i=0;i<7;i++){const g=new THREE.Group();for(let j=0;j<4;j++){const c=new THREE.Mesh(new THREE.SphereGeometry(.65+Math.random()*.3,14,12),new THREE.MeshBasicMaterial({color:'#fffaf0',transparent:true,opacity:.72}));c.position.set(j*.65,.15+(j%2)*.2,0);g.add(c)}g.position.set(-18+i*7,10+Math.random()*3,-13-Math.random()*8);scene.add(g);clouds.push(g)}
 // character: a camera-facing 2D sprite, using the existing hand-drawn Mei Mei art
 const textureLoader=new THREE.TextureLoader();const catTexture=textureLoader.load(new URL('../assets/images/mei-mei.svg',import.meta.url).href);catTexture.colorSpace=THREE.SRGBColorSpace;
 const cat=new THREE.Sprite(new THREE.SpriteMaterial({map:catTexture,transparent:true,depthWrite:false}));cat.scale.set(1.95,1.7,1);cat.position.set(0,1.75,6);scene.add(cat);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.58,24),new THREE.MeshBasicMaterial({color:'#405c48',transparent:true,opacity:.2}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,.79,6);scene.add(shadow);
 // Friendly 2D neighbours: flat, camera-facing sprites among the 3D scenery.
 function neighbour(emoji,x,z,name){const cv=document.createElement('canvas');cv.width=256;cv.height=320;const c=cv.getContext('2d');c.font='170px serif';c.textAlign='center';c.textBaseline='middle';c.fillText(emoji,128,150);c.font='bold 25px sans-serif';c.fillStyle='#fffaf0';c.strokeStyle='#63785d';c.lineWidth=5;c.strokeText(name,128,282);c.fillText(name,128,282);const tex=new THREE.CanvasTexture(cv);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.scale.set(1.45,1.8,1);s.position.set(x,1.7,z);scene.add(s);neighbours.push({sprite:s,x,z})}
 neighbour('🐧',-2,1,'Pip');neighbour('🐻',3,3,'Mochi');neighbour('🐰',8,5,'Clover');
 // little signposts
 function sign(x,z,label){const g=new THREE.Group();g.position.set(x,.8,z);scene.add(g);box(g,.12,1,.12,wood,0,.5,0);box(g,1.2,.42,.14,cream,0,.95,.04);const cv=document.createElement('canvas');cv.width=256;cv.height=96;const ctx=cv.getContext('2d');ctx.fillStyle='#5d7156';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.fillText(label,128,59);const tex=new THREE.CanvasTexture(cv);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:true}));sprite.scale.set(1.05,.4,1);sprite.position.set(0,1,.12);g.add(sprite)}
 sign(-7,5,'POND');sign(-6,-6.8,'COTTAGE');sign(7,-5.5,'MARKET');sign(8,6,'GARDEN');sign(1,-7,'BAKERY');
 const hotspots=[{id:'fishing',label:'Go fishing',x:-7,z:3,r:3.2},{id:'home',label:'Visit your cottage',x:-6,z:-5,r:2.5},{id:'cleaning',label:'Tidy the cottage',x:-3.2,z:-5,r:1.8},{id:'cooking',label:'Visit the bakery kitchen',x:1,z:-5.5,r:2.3},{id:'shop',label:'Visit the little shop',x:7,z:-4,r:3},{id:'garden',label:'Explore the flower garden',x:8,z:5,r:3}];
 const keys=new Set();const pressed=new Set();let active=null,started=false,last=performance.now(),walk=0,clockLast=0;const neighbours=[];
 const keydown=e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'&&active&&started)onInteract?.(active.id==='garden'?'journal':active.id);if(e.key==='Escape')document.getElementById('pause-button')?.click()};
 const keyup=e=>keys.delete(e.key.toLowerCase());window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
 document.querySelectorAll('[data-move]').forEach(btn=>{const k={up:'w',down:'s',left:'a',right:'d'}[btn.dataset.move];btn.addEventListener('pointerdown',e=>{e.preventDefault();pressed.add(k)});['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>pressed.delete(k)))});
 document.getElementById('play-button').addEventListener('click',()=>{started=true});
 document.getElementById('interaction-hint').addEventListener('click',()=>{if(active&&started)onInteract?.(active.id)});
 let dragging=false,lastX=0;canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX});window.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointermove',e=>{if(dragging&&started){cameraAngle+=(e.clientX-lastX)*.004;lastX=e.clientX}});
 let cameraAngle=0;
 const player=new THREE.Vector3(0,0,6);
 function inIsland(x,z){return (x*x)/(14.5*14.5)+(z*z)/(10.8*10.8)<.94}
 function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.04);last=now;
   if(started){let dx=0,dz=0;if(keys.has('w')||keys.has('arrowup')||pressed.has('w'))dz-=1;if(keys.has('s')||keys.has('arrowdown')||pressed.has('s'))dz+=1;if(keys.has('a')||keys.has('arrowleft')||pressed.has('a'))dx-=1;if(keys.has('d')||keys.has('arrowright')||pressed.has('d'))dx+=1;const len=Math.hypot(dx,dz);if(len){dx/=len;dz/=len;const ca=Math.cos(cameraAngle),sa=Math.sin(cameraAngle);const mx=(dx*ca+dz*sa),mz=(-dx*sa+dz*ca);const nx=player.x+mx*4.2*dt,nz=player.z+mz*4.2*dt;if(inIsland(nx,nz)){player.x=nx;player.z=nz}walk+=dt*10;cat.position.y=1.75+Math.abs(Math.sin(walk))*.09;cat.material.rotation=-mx*.12}else{cat.position.y=1.75+Math.sin(now*.0018)*.025;cat.material.rotation=0}
     cat.position.x=player.x;cat.position.z=player.z;shadow.position.x=player.x;shadow.position.z=player.z;
   }
   const target=new THREE.Vector3(player.x,0,player.z);const offset=new THREE.Vector3(Math.sin(cameraAngle)*13,10,Math.cos(cameraAngle)*15);const desired=target.clone().add(offset);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(player.x,.4,player.z-1.2);
   active=null;let best=999;for(const h of hotspots){const d=Math.hypot(player.x-h.x,player.z-h.z);if(d<h.r&&d<best){active=h;best=d}}
   const hint=document.getElementById('interaction-hint');if(hint){hint.classList.toggle('hidden',!started||!active);if(active)document.getElementById('interaction-label').textContent=active.label}neighbours.forEach(n=>{n.sprite.material.rotation=Math.sin(now*.001+n.x)*.025;n.sprite.position.y=1.7+Math.sin(now*.002+n.z)*.035});
   clouds.forEach((c,i)=>{c.position.x+=dt*(.12+i*.012);if(c.position.x>23)c.position.x=-23});
   water.color.setHSL(.51,.34,.59+Math.sin(now*.0007)*.018);
   const hour=new Date().getHours();const night=hour<6||hour>20;sun.intensity=night?1.15:3;hemi.intensity=night?1.05:2;scene.fog.color.set(night?'#879da9':'#c7ded7');scene.background.set(night?'#879da9':'#b9d8d5');
   if(now-clockLast>15000){clockLast=now;onClock?.(hour<6?'Quiet night':hour<11?'Fresh morning':hour<17?'Sunny afternoon':hour<20?'Golden evening':'Quiet night')}
   renderer.render(scene,camera);
 }
 camera.position.set(0,11,22);camera.lookAt(0,0,3);requestAnimationFrame(frame);
 window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
 return {scene,camera,renderer};
}