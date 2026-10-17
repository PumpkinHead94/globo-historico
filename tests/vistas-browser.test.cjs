const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader']});try{
const p=await b.newPage({offline:true,viewport:{width:1366,height:768}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);await p.waitForFunction(()=>GH.app?.globe&&GH.epochs);
await p.evaluate(()=>GH.epochs.change(-500));assert.deepEqual(await p.evaluate(()=>[...new Set(GH.epochs.items.map(i=>i.place.epochLayer))]),['territory']);assert.equal(await p.evaluate(()=>GH.app.globe.layers.soft),true);
await p.evaluate(()=>document.querySelector('#epoch-panel').open=true);await p.selectOption('#map-view','trade');assert.deepEqual((await p.evaluate(()=>[...new Set(GH.epochs.items.map(i=>i.place.epochLayer))])).sort(),['city','route']);
await p.evaluate(()=>GH.app.execute('vista recursos económicos'));assert.deepEqual(await p.evaluate(()=>[...new Set(GH.epochs.items.map(i=>i.place.epochLayer))]),['resource']);
await p.locator('#epoch-territory').check();assert.equal(await p.locator('#map-view').inputValue(),'custom');
await p.evaluate(()=>{const g=GH.app.globe;g.distance=3.03;g.drawLabels();});assert.ok(await p.locator('.landform-label:visible').count()<=6);
await p.screenshot({path:path.resolve(__dirname,'../../qa-globo/vistas.png')});
await p.selectOption('#map-view','geography');assert.equal(await p.evaluate(()=>GH.epochs.items.length),0);assert.equal(await p.evaluate(()=>GH.app.globe.layers.soft),false);
await p.evaluate(()=>{document.querySelector('#gesture-panel').hidden=false;GH.gestures.stop();});assert.equal(await p.locator('#gesture-panel').isVisible(),false);
assert.deepEqual(errors,[]);console.log('PASS: vistas por mouse y voz, personalización, relieve suave, límite de nombres y cierre de gestos.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
