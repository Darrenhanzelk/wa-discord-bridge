import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Fonnte payload: { sender, message, name, ... }
  const { sender, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message content' });
  }

  try {
    // Send to Discord Webhook
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `**WhatsApp (${sender || 'Unknown'}):** ${message}`
    });
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error forwarding to Discord:', error);
    return res.status(500).json({ error: 'Failed to send to Discord' });
  }
}
