import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { typeWebhook, messageData, senderData } = req.body;

  // 1. Validate it's an incoming text message
  if (typeWebhook !== 'incomingMessageReceived') {
    return res.status(200).json({ status: 'ignored' });
  }

  // 2. Filter by Allowed Groups
  const allowedGroups = process.env.ALLOWED_GROUPS ? process.env.ALLOWED_GROUPS.split(',').map(s => s.trim()) : [];
  if (allowedGroups.length > 0 && !allowedGroups.includes(senderData.chatId)) {
    return res.status(200).json({ status: 'ignored' });
  }

  const sender = senderData.senderName || senderData.sender.replace('@c.us', '');
  const group = senderData.chatName || 'Private';
  const msgType = messageData.typeMessage;

  // Create an Embed for a cleaner look
  const embed = {
    title: `New Message in ${group}`,
    color: 0x25D366, // WhatsApp Green
    fields: [
      { name: 'From', value: sender, inline: true }
    ],
    timestamp: new Date().toISOString()
  };

  if (msgType === 'textMessage') {
    embed.description = messageData.textMessageData.textMessage;
  } 
  else if (['imageMessage', 'audioMessage', 'documentMessage', 'videoMessage'].includes(msgType)) {
    const media = messageData[msgType + 'Data'];
    embed.description = `📎 **${msgType.replace('Message', '')}**`;
    embed.url = media.url;
    if (msgType === 'imageMessage') {
      embed.image = { url: media.url };
    } else {
      embed.fields.push({ name: 'Link', value: `[Download Here](${media.url})` });
    }
  } else {
    return res.status(200).json({ status: 'ignored (unsupported type)' });
  }

  try {
    // Send to Discord Webhook using embeds
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      embeds: [embed]
    });
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed' });
  }
}
