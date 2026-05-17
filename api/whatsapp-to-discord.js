import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { typeWebhook, messageData, senderData } = req.body;

  // 1. Validate it's an incoming text message
  if (typeWebhook !== 'incomingMessageReceived' || messageData?.typeMessage !== 'textMessage') {
    return res.status(200).json({ status: 'ignored' });
  }

  // 2. Filter by Allowed Groups (if ALLOWED_GROUPS environment variable is set)
  // Format in Vercel: 120363xxxx@g.us,120363yyyy@g.us
  const allowedGroups = process.env.ALLOWED_GROUPS 
    ? process.env.ALLOWED_GROUPS.split(',').map(s => s.trim()) 
    : [];

  if (allowedGroups.length > 0 && !allowedGroups.includes(senderData.chatId)) {
    return res.status(200).json({ status: 'ignored (group not allowed)' });
  }

  const message = messageData.textMessageData.textMessage;
  const sender = senderData.senderName || senderData.sender.replace('@c.us', '');
  const group = senderData.chatName || 'Private';

  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `**[${group}] ${sender}:** ${message}`
    });
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed' });
  }
}
