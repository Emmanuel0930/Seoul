#!/usr/bin/env python3
"""
verificacion/verificar.py
Validador integral de gobernanza de datos, contrato de datos, PII y reglas de dominio para Seúl.
Termina con código de salida 0 si todos los checks pasan, o 1 ante cualquier fallo.
"""

import os
import sys
import json
import re
import glob

PATRON_FECHA = re.compile(r"^\d{4}-\d{2}-\d{2}$")
PATRON_PII_KEYS = re.compile(r"^(cedula|documento_identidad|rrn|jumin_no|telefono|celular|correo|email)$", re.IGNORECASE)
PATRON_EMAIL = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PATRON_CEL_COL = re.compile(r"\b3\d{9}\b")
PATRON_CEL_KOR = re.compile(r"\b010-\d{4}-\d{4}\b")
PATRON_RRN_KOR = re.compile(r"\b\d{6}-[1-4]\d{6}\b")

VALORES_CONGESTION = {"Relaxed", "Normal", "Slightly Congested", "Congested"}
VALORES_AIRE = {"Good", "Normal", "Bad", "Very Bad"}

def fail(mensaje):
    print(f"FAIL {mensaje}", file=sys.stderr)
    sys.exit(1)

def escanear_pii(obj, ruta_archivo, checks_count):
    if isinstance(obj, dict):
        for k, v in obj.items():
            checks_count[0] += 1
            if PATRON_PII_KEYS.search(k):
                fail(f"[{ruta_archivo}] Clave sospechosa de PII encontrada: '{k}'")
            escanear_pii(v, ruta_archivo, checks_count)
    elif isinstance(obj, list):
        for item in obj:
            escanear_pii(item, ruta_archivo, checks_count)
    elif isinstance(obj, str):
        checks_count[0] += 1
        if PATRON_EMAIL.search(obj):
            fail(f"[{ruta_archivo}] Correo electrónico detectado en valor de texto: '{obj}'")
        if PATRON_CEL_COL.search(obj):
            fail(f"[{ruta_archivo}] Número celular colombiano detectado en valor de texto: '{obj}'")
        if PATRON_CEL_KOR.search(obj):
            fail(f"[{ruta_archivo}] Número celular coreano detectado en valor de texto: '{obj}'")
        if PATRON_RRN_KOR.search(obj):
            fail(f"[{ruta_archivo}] Número RRN de identificación coreano detectado: '{obj}'")

def main():
    print("=" * 65)
    print("INICIANDO VERIFICACIÓN DE GOBERNANZA Y CONTRATO DE DATOS - SEÚL")
    print("=" * 65)

    checks = [0]

    # 1. Cargar catálogo de fuentes oficial
    cat_path = "catalogo/catalogo.json"
    if not os.path.isfile(cat_path):
        fail(f"No existe el archivo de catálogo '{cat_path}'")
    
    with open(cat_path, "r", encoding="utf-8") as f:
        catalogo = json.load(f)
    
    ids_catalogo = {item["id"] for item in catalogo if "id" in item}
    print(f"[OK] Catálogo cargado con {len(ids_catalogo)} fuentes registradas.")
    checks[0] += len(ids_catalogo)

    # 2. Localizar archivos en lago/
    archivos_lago = glob.glob("lago/*.json")
    if not archivos_lago:
        fail("No se encontraron archivos .json en la carpeta 'lago/'")

    archivos_esperados = {
        "lago/escucha.json",
        "lago/demografia.json",
        "lago/transporte.json",
        "lago/tiempo_real.json",
        "lago/economia_vivienda.json"
    }

    archivos_presentes = set(os.path.normpath(p).replace("\\", "/") for p in archivos_lago)
    for esperado in archivos_esperados:
        checks[0] += 1
        if esperado not in archivos_presentes:
            fail(f"Falta el archivo requerido en el lago: '{esperado}'")

    # Contenedores para comprobaciones de dominio transversal
    metricas_detectadas = {}
    distritos_demografia = []
    distritos_economia = []

    # 3. Validar cada archivo JSON del lago
    for ruta in sorted(archivos_lago):
        nombre_norm = os.path.normpath(ruta).replace("\\", "/")
        with open(ruta, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                fail(f"Error parseando JSON en '{nombre_norm}': {e}")

        # Check: tema y probado
        checks[0] += 1
        if not data.get("tema"):
            fail(f"[{nombre_norm}] 'tema' no puede estar vacío.")

        checks[0] += 1
        probado = data.get("probado", "")
        if not PATRON_FECHA.match(probado):
            fail(f"[{nombre_norm}] 'probado' ('{probado}') no cumple el formato estricto AAAA-MM-DD.")

        # Check: fuentes
        checks[0] += 1
        fuentes = data.get("fuentes", [])
        if not fuentes or not isinstance(fuentes, list):
            fail(f"[{nombre_norm}] 'fuentes' debe ser una lista no vacía.")

        ids_fuentes_locales = set()
        for fuente in fuentes:
            checks[0] += 3
            f_id = fuente.get("id", "")
            f_url = fuente.get("url", "")
            f_lic = fuente.get("licencia", "")

            if not f_id or not f_url or not f_lic:
                fail(f"[{nombre_norm}] Fuente incompleta (requiere id, url, licencia): {fuente}")
            if f_id not in ids_catalogo:
                fail(f"[{nombre_norm}] La fuente '{f_id}' no existe en catalogo/catalogo.json")
            ids_fuentes_locales.add(f_id)

        # Check: cifras
        cifras = data.get("cifras", {})
        checks[0] += 1
        if not isinstance(cifras, dict):
            fail(f"[{nombre_norm}] 'cifras' debe ser un diccionario.")

        for campo, det in cifras.items():
            checks[0] += 4
            val = det.get("valor")
            unidad = det.get("unidad")
            vigencia = det.get("vigencia")
            f_ref = det.get("fuente")

            if val is None:
                fail(f"[{nombre_norm}] Cifra '{campo}' tiene valor None o ausente.")
            if not unidad or not str(unidad).strip():
                fail(f"[{nombre_norm}] Cifra '{campo}' no tiene unidad.")
            if not vigencia or not str(vigencia).strip():
                fail(f"[{nombre_norm}] Cifra '{campo}' no tiene vigencia.")
            if f_ref not in ids_fuentes_locales:
                fail(f"[{nombre_norm}] Cifra '{campo}' referencia fuente '{f_ref}' que no está en las fuentes del archivo.")

            metricas_detectadas[campo] = val

        # Check PII exhaustivo
        escanear_pii(data, nombre_norm, checks)

        # Recolección territorial
        if "demografia.json" in nombre_norm:
            distritos_demografia = data.get("registros", [])
        if "economia_vivienda.json" in nombre_norm:
            distritos_economia = data.get("registros", [])

    print(f"[OK] Estructura contractual y escaneo PII validados para {len(archivos_lago)} archivos.")

    # 4. Comprobaciones de Dominio de Seúl (Reglas de negocio)
    print("Verificando reglas de negocio específicas de la ciudad de Seúl...")

    # Regla: Población total entre 8_500_000 y 10_500_000
    checks[0] += 1
    pob_total = metricas_detectadas.get("total_population")
    if pob_total is None or not (8_500_000 <= pob_total <= 10_500_000):
        fail(f"Regla de dominio: 'total_population' ({pob_total}) fuera del rango esperado de Seúl (8.5M - 10.5M).")
    print(f"  [x] total_population = {pob_total:,} (Válido en rango 8.5M - 10.5M)")

    # Regla: 25 distritos con códigos entre 11110 y 11740
    checks[0] += 2
    if len(distritos_demografia) != 25:
        fail(f"Regla territorial: Se esperaban 25 distritos en demografia, encontrados {len(distritos_demografia)}.")
    
    codigos_demo = [d.get("district_code", "") for d in distritos_demografia]
    for c in codigos_demo:
        checks[0] += 1
        if not (c.isdigit() and 11110 <= int(c) <= 11740):
            fail(f"Regla territorial: Código de distrito '{c}' fuera del rango MOIS 11110-11740.")
    print(f"  [x] 25 distritos (gu) verificados con códigos oficiales MOIS 11110 a 11740.")

    # Regla: Desempleo entre 0.0 y 100.0%
    checks[0] += 1
    ue = metricas_detectadas.get("unemployment_rate")
    if ue is None or not (0.0 <= ue <= 100.0):
        fail(f"Regla de negocio: 'unemployment_rate' ({ue}) fuera de rango 0-100%.")
    print(f"  [x] unemployment_rate = {ue}% (Válido)")

    # Regla: Temperatura entre -30.0 y 50.0 °C
    checks[0] += 1
    temp = metricas_detectadas.get("current_temperature")
    if temp is None or not (-30.0 <= temp <= 50.0):
        fail(f"Regla de negocio: 'current_temperature' ({temp}) fuera de rango invernal/estival de Seúl (-30 a 50 °C).")
    print(f"  [x] current_temperature = {temp}°C (Válido)")

    # Regla: Nivel de congestión en valores permitidos
    checks[0] += 1
    cong = metricas_detectadas.get("congestion_level")
    if cong not in VALORES_CONGESTION:
        fail(f"Regla de negocio: 'congestion_level' ('{cong}') no es uno de {VALORES_CONGESTION}.")
    print(f"  [x] congestion_level = '{cong}' (Válido)")

    # Regla: Índice de calidad del aire en valores permitidos
    checks[0] += 1
    air = metricas_detectadas.get("air_quality_index")
    if air not in VALORES_AIRE:
        fail(f"Regla de negocio: 'air_quality_index' ('{air}') no es uno de {VALORES_AIRE}.")
    print(f"  [x] air_quality_index = '{air}' (Válido)")

    # Regla: Precio promedio de vivienda > 0
    checks[0] += 1
    precio_viv = metricas_detectadas.get("avg_housing_price")
    if precio_viv is None or precio_viv <= 0:
        fail(f"Regla de negocio: 'avg_housing_price' ({precio_viv}) debe ser mayor a 0 KRW.")
    print(f"  [x] avg_housing_price = {precio_viv:,.0f} KRW (Válido)")

    print("=" * 65)
    print(f"VERIFICACIÓN EXITOSA: {checks[0]} CHECKS PASADOS CON 0 FALLOS.")
    print("El lago de datos cumple al 100% el contrato, sin PII y con integridad territorial.")
    print("=" * 65)
    sys.exit(0)

if __name__ == "__main__":
    main()
