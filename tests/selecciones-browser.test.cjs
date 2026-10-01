const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader']});
 try{
  const ctx=await browser.newContext({offline:true,viewport:{width:1440,height:1000}});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);await page.waitForFunction(()=>!!GH.app?.globe);
  await page.locator('#commands-panel summary').click();
  async function command(text){await page.locator('#command').fill(text);await page.locator('#command').press('Enter');}
  await command('seleccionar Argentina, Chile y Perú');
  assert.equal(await page.evaluate(()=>GH.app.selections.items.size),3);
  assert.equal(await page.evaluate(()=>new Set(GH.app.selections.values().map(i=>i.color)).size),3);
  const alpha=await page.evaluate(()=>{const c=GH.app.globe.selectionCanvas.getContext('2d');return [[-63,-38],[-71,-35],[-74,-10]].map(([lon,lat])=>c.getImageData(Math.floor((lon+180)/360*4096),Math.floor((90-lat)/180*2048),1,1).data[3]);});
  assert.ok(alpha.every(a=>a>0),'Los polígonos deben estar pintados en la textura');
  const colors=await page.evaluate(()=>GH.app.selections.values().map(i=>i.color));await command('ir a Argentina');
  assert.equal(await page.evaluate(()=>GH.app.selections.items.size),3);assert.deepEqual(await page.evaluate(()=>GH.app.selections.values().map(i=>i.color)),colors);
  await command('mundo');assert.equal(await page.evaluate(()=>GH.app.selections.items.size),3);
  await command('seleccionar Brasil y Atlantis');assert.equal(await page.evaluate(()=>GH.app.selections.items.size),3);assert.equal(await page.locator('#status').getAttribute('data-error'),'true');
  await command('quitar Chile');assert.equal(await page.evaluate(()=>GH.app.selections.items.size),2);
  await command('agregar Brasil');assert.equal(await page.evaluate(()=>GH.app.selections.items.size),3);
  await command('limpiar colores');assert.equal(await page.evaluate(()=>GH.app.selections.items.size),0);
  assert.equal(await page.evaluate(()=>GH.app.globe.selectionCanvas.getContext('2d').getImageData(1331,1456,1,1).data[3]),0);
  await page.evaluate(()=>GH.app.receiveVoice('Globo seleccionar Argentina y Chile y Perú'));assert.equal(await page.evaluate(()=>GH.app.selections.items.size),3);
  await page.locator('#sidebar-toggle').click();await page.locator('#selections-panel summary').click();
  assert.equal(await page.locator('.selected-row').count(),3);
  await page.locator('#show-selections').click();await page.waitForTimeout(1400);
  const out=process.env.QA_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'selecciones.png')});
  await page.getByRole('button',{name:'Quitar Chile',exact:true}).click();assert.equal(await page.locator('.selected-row').count(),2);
  await page.locator('#clear-selections').click();await command('seleccionar Europa Occidental y África del Norte');assert.equal(await page.evaluate(()=>GH.app.selections.items.size),2);
  await page.locator('#sidebar-toggle').click();await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);console.log('PASS: catálogo ampliado, áreas pintadas, colores únicos y estables, acumulación, eliminación, limpieza, regiones, voz compartida y móvil sin red.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

