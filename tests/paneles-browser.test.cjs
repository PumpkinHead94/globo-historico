const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader']});
 try {
  const page=await browser.newPage({offline:true});
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.waitForFunction(()=>window.GH?.app?.globe);
  for(const viewport of [{width:1440,height:900},{width:800,height:700},{width:390,height:844}]) {
   await page.setViewportSize(viewport);
   await page.evaluate(()=>{
    document.querySelector('#epoch-panel').open=true;
    document.querySelector('#gesture-panel').hidden=false;
    document.querySelector('#gesture-panel details').open=true;
    const terrain=document.querySelector('#terrain-card');terrain.hidden=false;terrain.open=true;
    document.querySelector('#terrain-name').textContent='Territorio de prueba';
   });
   const rects=await page.evaluate(()=>['epoch-panel','gesture-panel','terrain-card'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};}));
   for(let i=1;i<rects.length;i++) assert.ok(rects[i].top>=rects[i-1].bottom+9,'Los paneles no deben superponerse');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('#gesture-stop').scrollIntoViewIfNeeded();
   await page.locator('#gesture-stop').click();
   await page.locator('#epoch-century').scrollIntoViewIfNeeded();
   await page.selectOption('#epoch-century','-5');
   assert.equal(await page.evaluate(()=>GH.epochs.current.year),-500);
   await page.screenshot({path:path.resolve(__dirname,`../../qa-globo/paneles-${viewport.width}.png`)});
  }
  console.log('PASS: paneles sin superposición, desplazamiento y controles accesibles en 1440, 800 y 390 px.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
