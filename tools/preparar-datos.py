"""Preparación de datos; no se ejecuta al usar la aplicación.
Uso: python tools/preparar-datos.py CARPETA_DE_DESCARGAS
Requiere numpy y netCDF4 solo en la máquina de desarrollo.
"""
from pathlib import Path
import base64, json, sys, tarfile, zipfile, io
import numpy as np
import netCDF4

source = Path(sys.argv[1])
root = Path(__file__).resolve().parents[1]
with netCDF4.Dataset(source / 'earth_relief_10m_p.grd') as dataset:
    # NetCDF aplica scale_factor=0.5. Redondear a metros, ordenar norte -> sur.
    heights = np.rint(dataset.variables['z'][:]).astype('<i2')[::-1]
    meta = {'width': heights.shape[1], 'height': heights.shape[0], 'stepDegrees': 1/6,
            'source': dataset.title, 'description': dataset.description,
            'encoding': 'signed-int16-le-metres-north-to-south',
            'base64': base64.b64encode(heights.tobytes()).decode('ascii')}
    (root / 'datos/relieve.js').write_text('window.GH = window.GH || {}; GH.terrainData = '+json.dumps(meta)+';',encoding='utf8')
for name in ['rivers','lakes']:
    data = json.loads((source / (name+'.geojson')).read_text(encoding='utf8'))
    # Conservar geometría original y nombre; descartar metadatos de estilo ajenos.
    for feature in data['features']:
        feature['properties'] = {'name': feature['properties'].get('name')}
    (root / ('datos/'+name+'.js')).write_text('window.GH = window.GH || {}; GH.'+name+' = '+json.dumps(data,separators=(',',':'))+';',encoding='utf8')
with zipfile.ZipFile(source / 'vosk-model-small-es-0.42.zip') as archive:
    with tarfile.open(root / 'voz/modelo-es.tar.gz','w:gz') as out:
        directories = set()
        for item in archive.infolist():
            if item.is_dir(): continue
            relative = Path(item.filename).parts[1:]
            if not relative or '..' in relative: raise ValueError('Ruta inesperada en modelo')
            for depth in range(len(relative)):
                directory='/'.join(('model',)+relative[:depth])
                if directory not in directories:
                    info=tarfile.TarInfo(directory+'/');info.type=tarfile.DIRTYPE;info.mode=0o755
                    out.addfile(info);directories.add(directory)
            data = archive.read(item)
            info = tarfile.TarInfo('model/'+'/'.join(relative)); info.size = len(data); info.mode = 0o644
            out.addfile(info,io.BytesIO(data))
            if relative == ('README',): (root/'licencias/modelo-es-README.txt').write_bytes(data)
print('Datos hipsométricos, ríos, lagos y modelo de voz preparados.')
