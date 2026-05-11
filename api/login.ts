import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permite POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { password } = req.body as { password?: string };

  if (!password) {
    return res.status(400).json({ error: 'Contraseña requerida' });
  }

  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return res.status(500).json({ error: 'Configuración del servidor incompleta' });
  }

  // Comparación en tiempo constante para evitar timing attacks
  const inputBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(appPassword);

  const match =
    inputBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(inputBuffer, expectedBuffer);

  if (!match) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  // Token simple basado en timestamp + secret — no expone la contraseña
  const token = crypto
    .createHmac('sha256', appPassword)
    .update(Date.now().toString())
    .digest('hex');

  return res.status(200).json({ token });
}
