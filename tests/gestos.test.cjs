const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/gestos.js'),'utf8'),ctx);const G=ctx.window.GH.GestureZoom;
function hand(aperture=0.1,fist=false,scale=1){const p=Array.from({length:21},()=>({x:0.5,y:0.5}));p[0]={x:0.5,y:0.8};p[9]={x:0.5,y:0.6};for(const i of [8,12,16,20]){p[i-2]={x:0.5,y:0.45};p[i]={x:0.5,y:fist?0.6:0.25};}p[4]={x:0.5+aperture*0.2,y:p[8].y};return p.map(v=>({x:0.5+(v.x-0.5)*scale,y:0.5+(v.y-0.5)*scale}));}
let g=new G();assert.equal(g.update([hand(1)],1,0).delta,0);assert.equal(g.active,false);g.update([hand()],1,100);g.update([hand()],1,400);assert.equal(g.active,true);assert.ok(g.update([hand(.5)],1,500).delta>0);assert.ok(g.update([hand(.2)],1,600).delta<0);assert.equal(g.update([hand(.2,true)],1,700).delta,0);assert.equal(g.active,false);
g=new G();g.update([hand()],1,0);g.update([hand()],1,300);assert.equal(g.update([hand(.1,false,1.5)],1,400).delta,0);assert.equal(g.update([hand(.11)],1,500).delta,0);g.update([],1,600);assert.equal(g.active,false);assert.equal(g.update([hand(.8)],1,700).delta,0);
g.update([hand()],1,800);g.update([hand()],1,1100);g.update([hand(),hand()],1,1200);assert.equal(g.active,false);g.update([hand()],1,1300);g.update([hand()],1,1600);assert.equal(g.update([hand(.8)],1,3800).delta,0);assert.equal(g.active,false);assert.equal(g.update([[]],1,3900).delta,0);
console.log('PASS: pinza sostenida, zoom en ambos sentidos, puño, pérdida, dos manos, pausa, escala independiente y zona muerta.');

g=new G();g.update([hand(.4)],1,0);g.update([hand(.4)],1,700);assert.equal(g.active,true);assert.ok(g.update([hand(.7)],1,1400).delta>0);g=new G();g.take();assert.equal(g.update([hand(.8)],1,0).delta,0);assert.equal(g.active,true);assert.ok(g.update([hand(.5)],1,700).delta<0);console.log("PASS: pinza tolerante, detector lento y toma manual sin salto.");

function shifted(x,aperture=1){return hand(aperture).map(p=>({...p,x:p.x+x}));}
g=new G();assert.equal(g.update([shifted(0)],1,0).rotation,undefined);assert.equal(g.update([shifted(0)],1,250).rotation,0);
assert.ok(g.update([shifted(.02)],1,350).rotation>0);assert.ok(g.update([shifted(0)],1,450).rotation<0);assert.equal(g.update([shifted(.002)],1,550).rotation,0);
assert.equal(g.update([shifted(.1)],1,650).rotation,6);assert.equal(g.update([shifted(.1)],1,750).rotation,0);
g.update([hand(.1,true)],1,850);assert.equal(g.update([shifted(0)],1,950).rotation,undefined);g.update([shifted(0)],1,1200);
g.update([hand(.1)],1,1300);g.update([hand(.1)],1,1500);assert.equal(g.active,true);const zoomOnly=g.update([shifted(.03,.7)],1,1600);assert.ok(zoomOnly.delta>0);assert.equal(zoomOnly.rotation,undefined);
g.update([],1,1700);assert.equal(g.active,false);assert.equal(g.update([shifted(.1)],1,1800).rotation,undefined);
g.update([shifted(.1)],1,2100);g.update([hand(),hand()],1,2200);assert.equal(g.update([shifted(0)],1,2300).rotation,undefined);
g=new G();g.update([shifted(0)],1,0);g.update([shifted(0)],1,250);assert.equal(g.update([shifted(.2)],1,2500).rotation,undefined);
console.log('PASS: giro bidireccional, inicio sin salto, temblores, límite, mano quieta, puño, exclusión de zoom, pérdida, dos manos y pausa.');

function moved(x,y,aperture=1){return shifted(x,aperture).map(p=>({...p,y:p.y+y}));}
g=new G();g.update([moved(0,0)],1,0);assert.equal(g.update([moved(0,0)],1,250).rotationY,0);
let r=g.update([moved(0,-.02)],1,350);assert.ok(r.rotationY<0);assert.equal(r.rotation,0);assert.equal(r.delta,0);
r=g.update([moved(0,.02)],1,450);assert.ok(r.rotationY>0);assert.equal(r.rotation,0);
r=g.update([moved(.02,.04)],1,550);assert.ok(r.rotation>0&&r.rotationY>0);
assert.equal(g.update([moved(.02,.042)],1,650).rotationY,0);assert.equal(g.update([moved(.02,.14)],1,750).rotationY,6);
assert.equal(g.update([moved(.02,.14)],1,850).rotationY,0);
g.update([],1,950);assert.equal(g.update([moved(0,-.1)],1,1050).rotationY,undefined);assert.equal(g.update([moved(0,-.1)],1,1300).rotationY,0);
g.take();g.update([moved(0,0,.8)],1,1400);r=g.update([moved(0,.03,.5)],1,1500);assert.equal(r.rotationY,undefined);assert.ok(r.delta<0);
console.log('PASS: arriba, abajo, diagonal, temblores, límite vertical, mano quieta, reaparición sin salto y zoom exclusivo.');
