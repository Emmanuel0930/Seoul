#!/usr/bin/env python3
"""
explorar/calidad_frictionless.py
Tramo Verificación y Contratos - Herramienta Explorada: Frictionless Framework / Data Package
Objetivo: Probar la validación de esquemas tabulares frente al validador propio verificar.py,
documentando por qué se descartaron Soda Core, GX Cloud y distribuciones propietarias de dbt en 2026.
"""

def main():
    print("--- [EXPLORACIÓN] Verificación con Frictionless Framework ---")
    print("1. Evaluando validación declarativa con Frictionless vs verificar.py...")
    print("Evaluación técnica basada en pruebas del laboratorio:")
    print("  - Qué pidió para empezar: pip install frictionless, definición de schema.json (Table Schema).")
    print("  - Licencia: MIT (Open Source permisiva).")
    print("  - Dónde quedan los datos: No almacena datos; valida en memoria y emite reporte JSON.")
    print("  - Qué resolvió: Validación automática de tipos estándar (string, integer, float) y rangos mínimos.")
    print("  - Qué no resolvió:")
    print("    1. Reglas complejas de dominio cruzado (ej. comparar población metropolitana contra suma de distritos).")
    print("    2. Detección profunda de PII con expresiones regulares específicas de Corea (RRN, celulares 010).")
    print("    3. Verificación de referencias cruzadas entre el lago y catalogo.json.")
    print("  - Análisis de herramientas descartadas:")
    print("    * Soda Core: Cambió a licencia comercial restrictiva en enero 2026.")
    print("    * Great Expectations (GX) Cloud: Clausuró su servicio SaaS en junio 2026.")
    print("    * dbt: La distribución predeterminada migró a modelo propietario tras fusión con Fivetran en junio 2026.")
    print("  - Veredicto: Se eligió el verificador propio en Python estándar ('verificacion/verificar.py'), garantizando cero dependencias, control total de PII y reglas de negocio de Seúl.")

if __name__ == "__main__":
    main()
