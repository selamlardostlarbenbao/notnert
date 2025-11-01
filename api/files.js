import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const { blobs } = await list();
    
    const files = blobs.map(blob => ({
      name: blob.pathname,
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));

    return res.status(200).json({ files });
  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({ error: error.message });
  }
}
