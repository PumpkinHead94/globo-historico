"""Reconstruye datos territoriales (GPL-3.0), descargando una revisión fija.
Solo para desarrollo: el atlas utiliza los archivos incluidos sin Internet.
"""
import json
import urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[1]
origin=json.loads((root/'datos/epocas/origen.json').read_text(encoding='utf-8'))
selected={-500:['Achaemenid Empire','Carthaginian Empire','Greek city-states','Rome'],-323:['Empire of Alexander','Carthaginian Empire','Greek city-states','Rome'],200:['Roman Empire','Parthian Empire','Armenia']}
result={}
for year,names in selected.items():
 filename=f'world_bc{-year}.geojson' if year<0 else f'world_{year}.geojson'
 url=f"https://raw.githubusercontent.com/aourednik/historical-basemaps/{origin['commit']}/geojson/{filename}"
 with urllib.request.urlopen(url) as response:data=json.load(response)
 filtered={'type':'FeatureCollection','features':[f for f in data['features'] if f['properties']['NAME'] in names]}
 assert set(f['properties']['NAME'] for f in filtered['features'])==set(names)
 (root/'datos/epocas'/filename).write_text(json.dumps(filtered,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 result[str(year)]=filtered
(root/'datos/epocas-geometrias.js').write_text('/* Historical Basemaps, A. Ourednik y colaboradores. Datos derivados GPL-3.0; ver datos/epocas y licencias. */\nwindow.GH=window.GH||{};GH.epochGeometry='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
print('Tres cortes territoriales reconstruidos.')
