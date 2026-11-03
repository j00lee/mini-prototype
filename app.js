const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
let color='#344e41',size=6,tool='brush',drawing=false,last=null,strokes=[],future=[],current=null;
const colors=[['Forest','#344e41'],['Charcoal','#303330'],['Coral','#e98c78'],['Golden','#e8bd60'],['Sage','#9eaf88'],['Blue','#87a9bf'],['Lavender','#b3a1c7']];
function setTool(next){tool=next;for(const t of ['brush','eraser']){$(t).classList.toggle('selected',t===tool);$(t).setAttribute('aria-pressed',t===tool)}canvas.style.cursor=tool==='eraser'?'cell':'crosshair'}
function setColor(value){color=value;$('color').value=value;setTool('brush');document.querySelectorAll('.swatch').forEach(b=>{const active=b.dataset.color===value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});$('dot').style.background=value}
colors.forEach(([name,value])=>{const b=document.createElement('button');b.className='swatch';b.style.background=value;b.dataset.color=value;b.title=name;b.setAttribute('aria-label',name);b.onclick=()=>setColor(value);$('palette').append(b)});setColor(color);
$('brush').onclick=()=>setTool('brush');$('eraser').onclick=()=>setTool('eraser');$('color').oninput=e=>setColor(e.target.value);$('size').oninput=e=>{size=+e.target.value;$('sizeValue').value=size;$('dot').style.transform=`scale(${Math.min(2,size/6)})`};
function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
function segment(s,a,b){ctx.globalCompositeOperation=s.tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();if(a.x===b.x&&a.y===b.y){ctx.arc(a.x,a.y,s.size/2,0,Math.PI*2);ctx.fill()}else{ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.globalCompositeOperation='source-over'}
function update(){ $('undo').disabled=!strokes.length;$('redo').disabled=!future.length;$('hint').hidden=strokes.length>0;$('status').textContent=strokes.length?'A little creativity looks good on you':'Ready when you are'}
function redraw(){ctx.clearRect(0,0,canvas.width,canvas.height);for(const s of strokes.flatMap(entry=>entry.group||[entry])){if(s.clear){ctx.clearRect(0,0,canvas.width,canvas.height);continue}let p=s.points[0];segment(s,p,p);for(const q of s.points.slice(1)){segment(s,p,q);p=q}}update()}
canvas.onpointerdown=e=>{if(drawing||e.button!==0)return;drawing=true;canvas.setPointerCapture(e.pointerId);last=point(e);current={tool,color,size:tool==='eraser'?size*3:size,points:[last]};segment(current,last,last);$('hint').hidden=true};
canvas.onpointermove=e=>{if(!drawing)return;for(const event of (e.getCoalescedEvents?.()||[e])){const p=point(event);segment(current,last,p);current.points.push(p);last=p}};
function finish(){if(!drawing)return;drawing=false;strokes.push(current);current=null;future=[];update()}
canvas.onpointerup=finish;canvas.onpointercancel=finish;canvas.onlostpointercapture=finish;
$('undo').onclick=()=>{finish();if(strokes.length)future.push(strokes.pop());redraw()};$('redo').onclick=()=>{finish();if(future.length)strokes.push(future.pop());redraw()};$('clear').onclick=()=>{finish();if(strokes.length)$('confirm').showModal()};$('cancel').onclick=()=>$('confirm').close();$('confirmClear').onclick=()=>{strokes.push({clear:true});future=[];redraw();$('confirm').close();$('status').textContent='A fresh canvas. A new possibility.'};
$('save').onclick=()=>{finish();const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;const c=out.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,out.width,out.height);c.drawImage(canvas,0,0);out.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='little-sketch.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='Your sketch is ready to keep.'},'image/png')};
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)||$('confirm').open)return;const key=e.key.toLowerCase();if((e.metaKey||e.ctrlKey)&&key==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click()}else if(!e.metaKey&&!e.ctrlKey){if(key==='b')setTool('brush');if(key==='e')setTool('eraser')}});

// Keep each generated scene in one undoable history entry.
function randomDrawing() {
  finish();
  const group = [{clear:true}];
  const random = (min,max) => min + Math.random() * (max-min);
  const pick = list => list[Math.floor(Math.random()*list.length)];
  const ink = pick(['#344e41','#516a87','#765680','#995e48']);
  const stroke = (points,color=ink,size=6) => group.push({tool:'brush',color,size,points});
  const ellipse = (x,y,rx,ry,color,width=6) => stroke(Array.from({length:65},(_,i)=>({x:x+Math.cos(i*Math.PI/32)*rx,y:y+Math.sin(i*Math.PI/32)*ry})),color,width);
  // A new little garden: rolling hills, a sun, and whimsical flowers.
  const horizon = random(740,830);
  for(let layer=0;layer<3;layer++) {
    const phase=random(0,6),base=horizon+layer*60;
    stroke(Array.from({length:81},(_,i)=>({x:i*20,y:base+Math.sin(i/13+phase)*random(18,20)})),['#b8c6a4','#9eaf88',ink][layer],5);
  }
  const sunX=random(180,1400),sunY=random(110,240),radius=random(40,65);
  ellipse(sunX,sunY,radius,radius,'#e8bd60',9);
  for(let i=0;i<12;i++) {
    const angle=i*Math.PI/6;
    stroke([radius+15,radius+33].map(r=>({x:sunX+Math.cos(angle)*r,y:sunY+Math.sin(angle)*r})),'#e8bd60',5);
  }
  const count=Math.floor(random(5,10));
  for(let i=0;i<count;i++) {
    const x=140+i*1320/(count-1)+random(-30,30),y=random(390,650),r=random(22,39);
    const petal=pick(['#e98c78','#e8bd60','#87a9bf','#b3a1c7']);
    stroke([{x,y},{x:x-10,y:(y+horizon)/2},{x:x+12,y:horizon+25}],ink,6);
    stroke([{x:x-5,y:y+110},{x:x-65,y:y+65},{x:x-48,y:y+115},{x:x-5,y:y+130}],ink,5);
    const petals=Math.floor(random(5,9));
    for(let j=0;j<petals;j++) {
      const a=j*Math.PI*2/petals;
      ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r,r*.7,r*.7,petal,8);
    }
    ellipse(x,y,r*.48,r*.48,ink,7);
  }
  strokes.push({group});future=[];redraw();
  $('status').textContent='You caught it! A new little garden. Undo to bring back your drawing.';
}

const playfulButton=document.querySelector('.click-here');
let dodges=0;
const maxDodges=3;
playfulButton.title='Catch me! After three dodges, I’ll stay still. Click to draw a random garden.';
function resetButton() {
  playfulButton.style.removeProperty('position');
  playfulButton.style.removeProperty('left');
  playfulButton.style.removeProperty('top');
  playfulButton.style.removeProperty('z-index');
}
playfulButton.addEventListener('pointerenter',event=>{
  // Touch and keyboard users can activate the button immediately.
  if(event.pointerType!=='mouse'||dodges>=maxDodges||playfulButton.matches(':focus-visible'))return;
  const rect=playfulButton.getBoundingClientRect(),margin=12;
  const maxX=Math.max(margin,window.innerWidth-rect.width-margin);
  const maxY=Math.max(margin,window.innerHeight-rect.height-margin);
  const candidates=Array.from({length:20},()=>({x:margin+Math.random()*(maxX-margin),y:margin+Math.random()*(maxY-margin)}));
  // Pick the farthest candidate so the new button never lands under the pointer.
  candidates.sort((a,b)=>Math.hypot(b.x+rect.width/2-event.clientX,b.y+rect.height/2-event.clientY)-Math.hypot(a.x+rect.width/2-event.clientX,a.y+rect.height/2-event.clientY));
  Object.assign(playfulButton.style,{position:'fixed',left:`${candidates[0].x}px`,top:`${candidates[0].y}px`,zIndex:'10'});
  dodges++;
  $('status').textContent=dodges===maxDodges?'Okay, you win. Click here — I’ll stay still!':`Catch me if you can! ${maxDodges-dodges} dodges left.`;
});
playfulButton.addEventListener('click',()=>{randomDrawing();resetButton();dodges=0});
window.addEventListener('resize',resetButton);
