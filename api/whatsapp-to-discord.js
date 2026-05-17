import axios from 'axios';

export default async function handler(req, res) {
  // Green API needs to verify the webhook URL with a GET request
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Green API specific payload structure
  const { typeWebhook, messageData, senderData } = req.body;

  // We only care about incoming text messages
  if (typeWebhook !== 'incomingMessageReceived' || messageData?.typeMessage !== 'textMessage') {
    return res.status(200).json({ status: 'ignored' }); // Ignore everything else
  }

  const message = messageData.textMessageData.textMessage;
  const sender = senderData.senderName || senderData.sender.replace('@c.us', '');
  const group = senderData.chatName || 'Private';

  try {
    // Send to Discord Webhook
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `**[${group}] ${sender}:** ${message}`
    });
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error forwarding to Discord:', error);
    return res.status(500).json({ error: 'Failed to send to Discord' });
  }
}
