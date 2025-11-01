import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Multipart form data parse etmek için
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Basit multipart parser
    const boundary = contentType.split('boundary=')[1];
    const parts = buffer.toString().split(`--${boundary}`);
    
    let filename = 'uploaded-file';
    let fileBuffer;

    for (const part of parts) {
      if (part.includes('filename=')) {
        const filenameMatch = part.match(/filename="(.+?)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
        
        const dataStart = part.indexOf('\r\n\r\n') + 4;
        const dataEnd = part.lastIndexOf('\r\n');
        fileBuffer = Buffer.from(part.slice(dataStart, dataEnd));
        break;
      }
    }

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file found' });
    }

    // Vercel Blob'a yükle
    const blob = await put(filename, fileBuffer, {
      access: 'public',
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      filename: filename,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
