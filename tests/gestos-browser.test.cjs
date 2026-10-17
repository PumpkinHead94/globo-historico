const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const name=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!name.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(name,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.wasm':'application/wasm','.css':'text/css'})[path.extname(name)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});try{
const page=await b.newPage({viewport:{width:1440,height:1000}}),errors=[],remote=[];
await page.route('**/*',route=>{if(!route.request().url().startsWith(url)){remote.push(route.request().url());return route.abort();}return route.continue();});
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.cameraCalls=0;window.framesSeen=0;const get=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=async c=>{cameraCalls++;window.testStream=await get(c);return testStream;};const W=window.Worker;window.Worker=class extends W{constructor(...a){super(...a);window.gestureTestWorker=this;this.addEventListener('message',e=>{if(e.data.type==='result')framesSeen++;});}};});
await page.goto(url);await page.waitForFunction(()=>window.GH?.gestures);assert.equal(await page.evaluate(()=>cameraCalls),0);
assert.equal(await page.evaluate(()=>{const g=GH.app.globe;const initial=g.target.distance;g.zoomGesture(.1);const closer=g.target.distance<initial;g.zoomGesture(-.1);const back=Math.abs(g.target.distance-initial)<1e-9;g.zoomGesture(100);const near=g.target.distance===1.3;g.zoomGesture(-100);const far=g.target.distance===5;g.zoomGesture(NaN);const finite=Number.isFinite(g.target.distance);g.world();return closer&&back&&near&&far&&finite;}),true);
await page.locator('#gestures-toggle').click();await page.waitForFunction(()=>framesSeen>=2,{},{timeout:60000});assert.match(await page.locator('#gesture-state').textContent(),/Buscando/);assert.equal(await page.evaluate(()=>testStream.getAudioTracks().length),0);
assert.equal(await page.evaluate(()=>{
 const g=GH.app.globe, start=g.target.lon, lat=g.target.lat, distance=g.target.distance;
 const hand=x=>{const p=Array.from({length:21},()=>({x:.5+x,y:.5}));p[0]={x:.5+x,y:.8};p[9]={x:.5+x,y:.6};for(const i of [8,12,16,20]){p[i-2]={x:.5+x,y:.45};p[i]={x:.5+x,y:.25};}p[4]={x:.7+x,y:.25};return p;};
 const frame=(x,time,y=0)=>gestureTestWorker.dispatchEvent(new MessageEvent('message',{data:{type:'result',landmarks:[hand(x).map(p=>({...p,y:p.y+y}))],aspect:1,time}}));
 frame(0,10000);frame(0,10250);frame(.02,10350);const right=g.target.lon>start;frame(-.02,10450);const left=g.target.lon<start;
 const lateralOnly=g.target.lat===lat;
 frame(-.02,10550,-.02);const up=g.target.lat<lat;
 frame(-.02,10650,.02);const down=g.target.lat>lat;
 const before={...g.target};frame(0,10750,.04);const diagonal=g.target.lon>before.lon&&g.target.lat>before.lat;
 g.target.lat=84;frame(0,10850,.08);const southLimit=g.target.lat===85;
 g.target.lat=-84;frame(0,10950,.04);const northLimit=g.target.lat===-85;
 const sameZoom=g.target.distance===distance;
 GH.gestures.release();g.world();return right&&left&&lateralOnly&&up&&down&&diagonal&&southLimit&&northLimit&&sameZoom;
}),true);

await page.locator('#gesture-panel details').evaluate(e=>e.open=true);await page.screenshot({path:path.resolve(__dirname,'../../qa-globo/gestos.png')});
await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>testStream.getTracks().every(t=>t.readyState==='ended')),true);assert.equal(await page.locator('#gestures-toggle').getAttribute('aria-pressed'),'false');
await page.locator('#gestures-toggle').click();await page.waitForFunction(()=>framesSeen>=4,{},{timeout:60000});await page.locator('#gesture-stop').click();assert.equal(await page.evaluate(()=>testStream.getTracks().every(t=>t.readyState==='ended')),true);
await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('denied','NotAllowedError')};});await page.locator('#gestures-toggle').click();await page.waitForFunction(()=>document.getElementById('gesture-state').textContent.includes('denegado'));
await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=()=>new Promise(r=>window.resolveCamera=r);});await page.locator('#gestures-toggle').click();await page.locator('#gestures-toggle').click();assert.equal(await page.evaluate(async()=>{let stopped=false;resolveCamera({getTracks:()=>[{stop:()=>stopped=true}]});await new Promise(r=>setTimeout(r,30));return stopped;}),true);
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.resolve(__dirname,'../../qa-globo/gestos-movil.png')});
assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);console.log('PASS: modelo real y WASM locales, fotogramas sintéticos sin mano, sin conexiones externas, cámara opt-in/sin audio, Escape, parada, reinicio, permiso denegado, cancelación durante permiso y ancho móvil.');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
