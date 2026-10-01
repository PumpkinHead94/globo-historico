const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = {location:{protocol:'file:'},addEventListener(){},d3:require('../vendor/d3.min.js')}; sandbox.window = sandbox; vm.createContext(sandbox);
for (const file of ['datos/lugares.js','datos/accidentes.js','datos/regiones.js','js/regiones.js','datos/hidrografia.js','js/hidrografia.js','datos/circulacion.js','datos/ampliacion.js','datos/historia.js','js/historia.js','js/selecciones.js','js/comandos.js','js/voz.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),sandbox);
const {commands,places,voice} = sandbox.GH;
test('Comandos, tildes, puntuación y alias históricos',()=>{
  for (const [input,id] of [['ir a Roma','roma'],['  ¡MUÉSTRAME   PARÍS!  ','paris'],['mostrame Egipto','egipto'],['llevame a Buenos Aires','buenos-aires'],['Constantinopla','estambul'],['ir a Tenochtitlán','mexico'],['Machu Picchu','machu-picchu']]) assert.equal(commands.parse(input).place.id,id);
});
test('Zoom, mundo, ayuda, vacío y destinos desconocidos',()=>{
  assert.equal(commands.parse('acercar').direction,1); assert.equal(commands.parse('alejar').direction,-1);
  assert.equal(commands.parse('volver al mundo').type,'world'); assert.equal(commands.parse('ayuda').type,'help');
  assert.equal(commands.parse(' ').type,'empty'); assert.equal(commands.parse('ir a Atlantis').type,'unknown');
  assert.equal(commands.parse('<img src=x onerror=alert(1)>').type,'unknown');
});
test('Catálogo con coordenadas válidas e identidades inequívocas',()=>{
  assert.equal(new Set(places.map(p=>p.id)).size,places.length);
  const names = new Map();
  for (const p of places) {
    assert.ok(Number.isFinite(p.lat) && Math.abs(p.lat)<=90); assert.ok(Number.isFinite(p.lon) && Math.abs(p.lon)<=180);
    for (const name of [p.name,...p.aliases]) {const n=commands.normalize(name); assert.ok(!names.has(n)||names.get(n)===p.id,`Alias duplicado: ${n}`); names.set(n,p.id); const result=commands.parse(name); if(p.category==='trade'){assert.equal(result.type,'history');assert.equal(result.topic,p.historyTopic);}else assert.equal(result.place?.id,p.id,'Nombre: '+name);}
  }
});
test('Listas, nombres compuestos y cambios de selección',()=>{
  for(const input of ['seleccionar Argentina, Chile y Perú','pintar argentina chile peru','mostrar Argentina; Chile; Perú'])assert.equal(commands.parse(input).places.length,3);
  assert.equal(commands.parse('seleccionar Trinidad y Tobago y Bosnia y Herzegovina').places.length,2);
  assert.equal(commands.parse('seleccionar Francia y Atlantis').type,'unknown');
  assert.equal(commands.parse('quitar Chile').type,'remove-selection');
  assert.equal(commands.parse('limpiar colores').type,'clear-selection');
  const selection=new sandbox.GH.Selections();const list=commands.parse('seleccionar Argentina y Chile').places;
  selection.add(list);const first=selection.values()[0].color;selection.add(list);assert.equal(selection.items.size,2);assert.equal(selection.values()[0].color,first);
  selection.remove([list[1]]);selection.add(commands.parse('seleccionar Perú y Brasil').places);
  assert.equal(new Set(selection.values().map(p=>p.color)).size,3);selection.clear();assert.equal(selection.items.size,0);
});
test('Voz inactiva por defecto y adaptador conectado al contrato',async()=>{
  assert.equal(voice.available,false); let error; assert.equal(await voice.start(()=>{},e=>error=e),false); assert.ok(error);
  let heard,stopped=false; voice.register({start(callback){callback('ir a Roma');},stop(){stopped=true;}});
  voice.start(text=>heard=text); assert.equal(heard,'ir a Roma'); voice.stop(); assert.equal(stopped,true);
});
test('Accidentes y capas por comandos',()=>{
  assert.equal(commands.parse('ir a los Andes').place.id,'andes');
  assert.equal(commands.parse('mostrame el Sahara').place.id,'sahara');
  assert.equal(commands.parse('mostrar ríos').layer,'water');
  assert.equal(commands.parse('ocultar accidentes').value,false);
  assert.equal(commands.parse('detener voz').type,'voice-stop');
});

