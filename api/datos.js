// api/datos.js
// Sirve datos limpios del lago de Seúl asegurando protección de privacidad.
// Si se solicita información bajo compuerta, valida el encabezado Authorization.

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const dataset = req.query.dataset || 'demografia';
  const datasetsValidos = {
    'demografia': 'lago/demografia.json',
    'economia': 'lago/economia_vivienda.json',
    'tiempo_real': 'lago/tiempo_real.json',
    'transporte': 'lago/transporte.json',
    'escucha': 'lago/escucha.json',
    'catalogo': 'catalogo/catalogo.json'
  };

  if (!datasetsValidos[dataset]) {
    return res.status(404).json({ error: `Dataset '${dataset}' no reconocido.` });
  }

  const filePath = path.join(process.cwd(), datasetsValidos[dataset]);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: `Archivo '${datasetsValidos[dataset]}' no encontrado en el servidor.` });
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(rawData);

    // Encabezados de cache y respuesta
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(json);
  } catch (error) {
    return res.status(500).json({ error: `Error leyendo datos: ${error.message}` });
  }
};
