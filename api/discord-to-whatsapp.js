import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Discord webhook payload extraction
  const { content, author } = req.body;

  // Filter out bot messages to avoid loops
  if (author && author.bot) {
    return res.status(200).end();
  }

  try {
    await axios.post('https://api.fonnte.com/send', {
      target: process.env.WHATSAPP_TARGET,
      message: `${author ? author.username : 'Discord'}: ${content}`
    }, {
      headers: { Authorization: process.env.FONNTE_TOKEN }
    });
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error forwarding to WhatsApp:', error);
    return res.status(500).json({ error: 'Failed to send to WhatsApp' });
  }
}
