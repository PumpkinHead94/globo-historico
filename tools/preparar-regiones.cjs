const fs=require('node:fs'),path=require('node:path');
const source=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const result=source.features.map(f=>({id:f.properties.ADM0_A3,name:f.properties.NAME_ES||f.properties.NAME_LONG,english:f.properties.NAME_LONG,continent:f.properties.CONTINENT,subregion:f.properties.SUBREGION,lat:f.properties.LABEL_Y,lon:f.properties.LABEL_X,geometry:f.geometry}));
fs.writeFileSync(path.join(__dirname,'../datos/regiones.js'),'window.GH=window.GH||{};GH.regionData='+JSON.stringify(result)+';');
console.log(result.length+' países y territorios empaquetados.');
