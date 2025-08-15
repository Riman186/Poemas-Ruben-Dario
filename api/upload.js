// api/upload.js
import { put } from '@vercel/blob';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método no permitido' });
  }

  const { audio } = request.body; // Recibe el audio en Base64 desde el frontend

  try {
    const blob = await put('poema-' + Date.now() + '.mp3', audio, {
      access: 'public', // Para que el audio sea accesible públicamente
      token: process.env.BLOB_READ_WRITE_TOKEN // Token automático de Vercel
    });

    return response.status(200).json({ url: blob.url });
  } catch (error) {
    return response.status(500).json({ error: 'Error al subir el audio' });
  }
}