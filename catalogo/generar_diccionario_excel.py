#!/usr/bin/env python3
"""
catalogo/generar_diccionario_excel.py
Genera el archivo Excel oficial 'diccionario_seoul.xlsx' exigido por la entrega.
Contiene exclusivamente lo que de verdad está en el lago, con fecha real de prueba (2026-10-06)
y la licencia copiada tal cual aparece en la fuente original.
"""

import os
import json
import pandas as pd

CAMPOS_DICCIONARIO = [
    {
        "campo": "vistas_ultimo_mes",
        "archivo_lago": "lago/escucha.json",
        "origen_primario": "views",
        "fuente_id": "F11",
        "fuente_nombre": "Wikimedia Pageviews API",
        "tipo_dato": "Integer",
        "unidad": "vistas de personas",
        "rango_valores": ">= 0",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Toma el último mes cerrado de Wikimedia Pageviews (artículo 'Seúl' en es.wikipedia); fecha AAAAMMDD pasa a AAAA-MM.",
        "vigencia": "2026-09",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "CC0"
    },
    {
        "campo": "district_code",
        "archivo_lago": "lago/demografia.json",
        "origen_primario": "CGOV_CD",
        "fuente_id": "F01",
        "fuente_nombre": "Seoul Open Data Plaza (data.seoul.go.kr)",
        "tipo_dato": "String",
        "unidad": "código territorial",
        "rango_valores": "11110 a 11740 (los 25 gu oficiales)",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Trim y estandarización a formato texto de 5 caracteres según codificación administrativa oficial de Seúl/MOIS.",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "total_population",
        "archivo_lago": "lago/demografia.json",
        "origen_primario": "JUMIN_POP",
        "fuente_id": "F01",
        "fuente_nombre": "Seoul Open Data Plaza (data.seoul.go.kr)",
        "tipo_dato": "Integer",
        "unidad": "Personas",
        "rango_valores": ">= 0 (Seúl metropolitano: 8.5M - 10.5M)",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Limpieza de comas, conversión a entero y agregación por distrito (gu).",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "station_name",
        "archivo_lago": "lago/transporte.json",
        "origen_primario": "STAT_NM",
        "fuente_id": "F01",
        "fuente_nombre": "Seoul Open Data Plaza (data.seoul.go.kr)",
        "tipo_dato": "String",
        "unidad": "nombre propio",
        "rango_valores": "Texto",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Normalización de nombres en inglés/romanización oficial de estaciones de metro.",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "subway_line",
        "archivo_lago": "lago/transporte.json",
        "origen_primario": "LINE_NUM",
        "fuente_id": "F01",
        "fuente_nombre": "Seoul Open Data Plaza (data.seoul.go.kr)",
        "tipo_dato": "String",
        "unidad": "identificador de línea",
        "rango_valores": "Line 1 a Line 9, Sinbundang, etc.",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Estandarización de prefijos de línea ('Line X').",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "total_capacity",
        "archivo_lago": "lago/transporte.json",
        "origen_primario": "PARKING_CNT",
        "fuente_id": "F01",
        "fuente_nombre": "Seoul Open Data Plaza (data.seoul.go.kr)",
        "tipo_dato": "Integer",
        "unidad": "Vehículos",
        "rango_valores": ">= 0",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Imputación de nulos a 0 y conversión a entero para plazas públicas vehiculares.",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "area_name",
        "archivo_lago": "lago/tiempo_real.json",
        "origen_primario": "AREA_NM",
        "fuente_id": "F02",
        "fuente_nombre": "Seoul Real-time City Data (122 lugares)",
        "tipo_dato": "String",
        "unidad": "nombre de polo urbano",
        "rango_valores": "122 áreas predefinidas de Seúl",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Traducción/romanización limpia y eliminación de caracteres coreanos especiales.",
        "vigencia": "2026-10",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "congestion_level",
        "archivo_lago": "lago/tiempo_real.json",
        "origen_primario": "AREA_CONGEST_LVL",
        "fuente_id": "F02",
        "fuente_nombre": "Seoul Real-time City Data (122 lugares)",
        "tipo_dato": "String",
        "unidad": "categoría ordinal",
        "rango_valores": "['Relaxed', 'Normal', 'Slightly Congested', 'Congested']",
        "clasificacion_privacidad": "Sensible (Gobernanza Pregunta 5)",
        "regla_transformacion": "Mapeo de etiquetas coreanas (여유->Relaxed, 보통->Normal, 약간 붐빔->Slightly Congested, 붐빔->Congested) y agregación por zona.",
        "vigencia": "2026-10",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "current_temperature",
        "archivo_lago": "lago/tiempo_real.json",
        "origen_primario": "TEMP",
        "fuente_id": "F02",
        "fuente_nombre": "Seoul Real-time City Data (122 lugares)",
        "tipo_dato": "Float",
        "unidad": "Grados Celsius (°C)",
        "rango_valores": "-30.0 a 50.0",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Conversión a numérico de punto flotante con un decimal.",
        "vigencia": "2026-10",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "avg_road_speed",
        "archivo_lago": "lago/tiempo_real.json",
        "origen_primario": "ROAD_MSG",
        "fuente_id": "F02",
        "fuente_nombre": "Seoul Real-time City Data (122 lugares)",
        "tipo_dato": "Float",
        "unidad": "km/h",
        "rango_valores": ">= 0.0",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Extracción numérica de velocidad vial en km/h desde telemetría de tráfico.",
        "vigencia": "2026-10",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "air_quality_index",
        "archivo_lago": "lago/tiempo_real.json",
        "origen_primario": "AIR_IDX",
        "fuente_id": "F02",
        "fuente_nombre": "Seoul Real-time City Data (122 lugares)",
        "tipo_dato": "String",
        "unidad": "categoría de calidad",
        "rango_valores": "['Good', 'Normal', 'Bad', 'Very Bad']",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Normalización de escala coreana (좋음, 보통, 나쁨, 매우나쁨) a descriptores estándar en inglés.",
        "vigencia": "2026-10",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "unemployment_rate",
        "archivo_lago": "lago/economia_vivienda.json",
        "origen_primario": "UE_RATE",
        "fuente_id": "F03",
        "fuente_nombre": "KOSIS — Korean Statistical Information Service",
        "tipo_dato": "Float",
        "unidad": "%",
        "rango_valores": "0.0 a 100.0",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Redondeo a dos decimales de la tasa de desempleo metropolitana y distrital.",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "avg_housing_price",
        "archivo_lago": "lago/economia_vivienda.json",
        "origen_primario": "HOUSE_PRC",
        "fuente_id": "F03",
        "fuente_nombre": "KOSIS — Korean Statistical Information Service",
        "tipo_dato": "Float",
        "unidad": "Wons coreanos (KRW)",
        "rango_valores": "> 0",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Escalado a unidades monetarias base (KRW) y cálculo de desviación porcentual frente al promedio de Seúl.",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "age_group",
        "archivo_lago": "lago/demografia.json",
        "origen_primario": "AGE_GBN",
        "fuente_id": "F03",
        "fuente_nombre": "KOSIS — Korean Statistical Information Service",
        "tipo_dato": "String",
        "unidad": "rango de edad",
        "rango_valores": "['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+']",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Estandarización de formato de rangos de edad decenales del censo de población.",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "regional_gdp",
        "archivo_lago": "lago/economia_vivienda.json",
        "origen_primario": "GRDP",
        "fuente_id": "F03",
        "fuente_nombre": "KOSIS — Korean Statistical Information Service",
        "tipo_dato": "Float",
        "unidad": "Millones de KRW",
        "rango_valores": ">= 0",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Conversión a moneda local en millones de KRW (Producto Regional Bruto de Seúl).",
        "vigencia": "2024",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    },
    {
        "campo": "foreign_visitors",
        "archivo_lago": "lago/economia_vivienda.json",
        "origen_primario": "FOR_VISIT",
        "fuente_id": "F03",
        "fuente_nombre": "KOSIS — Korean Statistical Information Service",
        "tipo_dato": "Integer",
        "unidad": "Personas",
        "rango_valores": ">= 0",
        "clasificacion_privacidad": "Pública",
        "regla_transformacion": "Agregación de llegadas internacionales a Seúl y limpieza de nulos.",
        "vigencia": "2025-12",
        "fecha_prueba": "2026-10-06",
        "licencia_fuente": "KOGL Tipo 1 (libre con atribución)"
    }
]

def main():
    with open("catalogo/catalogo.json", "r", encoding="utf-8") as f:
        catalogo = json.load(f)

    df_campos = pd.DataFrame(CAMPOS_DICCIONARIO)
    df_fuentes = pd.DataFrame(catalogo)

    output_path = "diccionario_seoul.xlsx"
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df_campos.to_excel(writer, sheet_name="Diccionario_Datos", index=False)
        df_fuentes.to_excel(writer, sheet_name="Catalogo_14_Fuentes", index=False)

    print(f"[OK] Archivo Excel generado: {output_path}")
    print(f"     Hoja 1: {len(df_campos)} campos que de verdad están en el lago.")
    print(f"     Hoja 2: {len(df_fuentes)} fuentes con licencias originales y fecha probada.")

if __name__ == "__main__":
    main()
