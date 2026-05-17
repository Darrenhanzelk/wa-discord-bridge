import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Fonnte payload extraction (adjust based on Fonnte docs)
  const { sender, message } = req.body; 

  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `**WhatsApp (${sender})**: ${message}`
    });
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error forwarding to Discord:', error);
    return res.status(500).json({ error: 'Failed to send to Discord' });
  }
}
