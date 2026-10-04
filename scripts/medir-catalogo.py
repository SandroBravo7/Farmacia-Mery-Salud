#!/usr/bin/env python3
"""Mide respuestas secuenciales del catálogo local con la API ya iniciada."""

import json
import platform
import statistics
import time
import urllib.request
from datetime import datetime
from pathlib import Path

URL = 'http://localhost:8080/api/productos'
OUT = Path(__file__).resolve().parents[1] / 'docs/evidencias/medicion_catalogo_mysql.json'


def request():
    start = time.perf_counter()
    with urllib.request.urlopen(URL, timeout=10) as response:
        products = json.load(response)
    return (time.perf_counter() - start) * 1000, len(products)


for _ in range(3):
    request()

samples = []
count = None
for _ in range(30):
    duration, count = request()
    samples.append(duration)

ordered = sorted(samples)
result = {
    'fecha': datetime.now().astimezone().isoformat(timespec='seconds'),
    'equipo': platform.platform(),
    'base_datos': 'MySQL 8.4 local',
    'url': URL,
    'productos': count,
    'calentamiento': 3,
    'muestras': len(samples),
    'minimo_ms': round(min(samples), 2),
    'mediana_ms': round(statistics.median(samples), 2),
    'p95_ms': round(ordered[27] + 0.55 * (ordered[28] - ordered[27]), 2),
    'maximo_ms': round(max(samples), 2),
    'criterio_ms': 3000,
    'cumple_criterio': max(samples) <= 3000,
}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False, indent=2))
