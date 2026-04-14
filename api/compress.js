const fetch = require('node-fetch');
const sharp = require('sharp');

module.exports = async function handler(req, res) {
  try {
    const { image_url } = req.query;

    console.log('[Request]', image_url);

    if (!image_url || !/^https?:\/\//i.test(image_url)) {
      console.error('[Validation Error] Invalid or missing image_url:', image_url);
      return res.status(400).json({ error: 'Invalid or missing image_url' });
    }

    const response = await fetch(image_url);
    if (!response.ok) {
      console.error('[Fetch Error]', response.status, image_url);
      return res.status(406).json({ error: 'Failed to fetch original image' });
    }

    // Fix: dùng arrayBuffer() thay buffer() cho node-fetch v2 ổn định hơn
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const compressed = await sharp(buffer)
      .jpeg({ quality: 50 })
      .toBuffer();

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.status(200).send(compressed);

    console.log('[Success] Image compressed and sent');

  } catch (error) {
    console.error('[Compression Error]', error);
    res.status(500).json({ error: 'Image compression failed' });
  }
};
