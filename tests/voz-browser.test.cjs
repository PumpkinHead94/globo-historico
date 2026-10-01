// Requiere el servidor local en 127.0.0.1:8765 y la muestra sintética incluida.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const multi=process.env.MULTI_VOICE==='1';
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+path.join(__dirname,multi?'multiseleccion-sintetica.wav':'comando-sintetico.wav'),'--autoplay-policy=no-user-gesture-required']});
 try{
  const context=await browser.newContext({viewport:{width:1366,height:768},permissions:['microphone']});
  const remote=[],errors=[];
  context.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).hostname!=='127.0.0.1')remote.push(request.url());});
  await context.route('**/*',route=>{const url=new URL(route.request().url());return /^https?:$/.test(url.protocol)&&url.hostname!=='127.0.0.1'?route.abort():route.continue();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
   navigator.mediaDevices.getUserMedia=async options=>{const stream=await original(options);window.__testTracks=stream.getTracks();return stream;};
  });
  await page.goto(process.env.GLOBO_URL||'http://127.0.0.1:8765/');await page.waitForFunction(()=>!!GH.app?.globe);
  await page.evaluate(()=>{window.__voiceTestHeard=[];const start=GH.voice.start;GH.voice.start=(onTranscript,...rest)=>start(text=>{window.__voiceTestHeard.push(text);onTranscript(text);},...rest);});
  assert.equal(await page.evaluate(()=>GH.voice.state),'idle');
  await page.locator('#voice-toggle').click();
  await page.waitForFunction(()=>GH.voice.state==='listening',null,{timeout:90000});
  if(multi){
    await page.waitForFunction(()=>GH.app.selections.items.size===3,null,{timeout:40000});
    assert.deepEqual(await page.evaluate(()=>GH.app.selections.values().map(i=>i.place.name)),['Argentina','Chile','Perú']);
    console.log('PASS: audio español -> Vosk real -> Globo -> tres países seleccionados y coloreados.');
  }else{
    await page.waitForFunction(()=>document.getElementById('place-name').textContent==='Roma',null,{timeout:30000}).catch(async error=>{console.log('Diagnostico de voz:',await page.evaluate(()=>({heard:window.__voiceTestHeard,status:document.getElementById('status').textContent,partial:document.getElementById('voice-transcript').textContent})));throw error;});
    console.log('PASS: audio sintético español -> Vosk real -> activación Globo -> destino Roma.');
  }
  await page.locator('#voice-toggle').click();assert.equal(await page.evaluate(()=>GH.voice.state),'idle');
  assert.ok(await page.evaluate(()=>window.__testTracks.every(t=>t.readyState==='ended')));
  // Reinicio sobre el modelo ya cargado.
  await page.locator('#voice-toggle').click();await page.waitForFunction(()=>GH.voice.state==='listening');
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>GH.voice.state),'idle');
  assert.ok(await page.evaluate(()=>window.__testTracks.every(t=>t.readyState==='ended')));
  // Denegación posterior: recuperación sin abandonar el control por texto.
  await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});
  await page.locator('#voice-toggle').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('No se habilitó'));
  assert.equal(await page.evaluate(()=>GH.voice.state),'idle');
  assert.deepEqual(remote,[]);assert.deepEqual(errors,[]);
  console.log('PASS: detener/reiniciar, Escape, cierre de pistas, permiso denegado y cero conexiones externas.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
