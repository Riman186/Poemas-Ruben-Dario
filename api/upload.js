import { put } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    try {
        const { audio } = req.body;
        const blob = await put(`poema-${Date.now()}.mp3`, Buffer.from(audio, 'base64'), {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        res.status(200).json({ url: blob.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}