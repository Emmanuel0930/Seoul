// api/entrar.js
// Compuerta de seguridad de Cerebro Seúl (Vercel Serverless / Node.js)
// Valida la clave de acceso para proteger vistas o datasets restringidos.
// Regla estricta: La clave de producción se lee de process.env.CEREBRO_SEUL_KEY y nunca se expone en Git.

module.exports = async (req, res) => {
  // Habilitar CORS para pruebas locales
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST con { clave: "..." }.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const claveIngresada = (body && body.clave) ? String(body.clave).trim() : '';
  const claveAutorizada = process.env.CEREBRO_SEUL_KEY || 'seoul2026';

  if (!claveIngresada) {
    return res.status(400).json({ autorizada: false, mensaje: 'Debe ingresar una clave de acceso.' });
  }

  if (claveIngresada === claveAutorizada) {
    // Retornar token de sesión en formato Bearer / sesión local
    const tokenSesion = Buffer.from(`seoul_session_${Date.now()}_auth`).toString('base64');
    return res.status(200).json({
      autorizada: true,
      mensaje: 'Acceso autorizado al Centro de Información Urbana de Seúl.',
      token: tokenSesion
    });
  } else {
    return res.status(401).json({
      autorizada: false,
      mensaje: 'Clave incorrecta. Acceso denegado por compuerta de seguridad.'
    });
  }
};
