  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { submitterName, email, campaignName, type, keyMessage, proofPoints, culturalRelevance, spokesperson, audience, markets, priority, launchDate, assets, context } = req.body;
    if (!campaignName || !keyMessage) return res.status(400).json({ error: 'Campaign name and key message are required.' });

    const blocks = [
      { type: 'header', text: { type: 'plain_text', text: `📋 New PR Brief — ${campaignName}`, emoji: true } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Submitted by:*\n${submitterName}${email ? ' (' + email + ')' : ''}` },
          { type: 'mrkdwn', text: `*Type:*\n${type || 'Not specified'}` },
          { type: 'mrkdwn', text: `*Priority:*\n${priority || 'Not specified'}` },
          { type: 'mrkdwn', text: `*Markets:*\n${markets || 'National'}` },
          { type: 'mrkdwn', text: `*Spokesperson:*\n${spokesperson || 'Not specified'}` },
          { type: 'mrkdwn', text: `*Launch date:*\n${launchDate || 'Not specified'}` }
        ]
      },
      { type: 'divider' },
      { type: 'section', text: { type: 'mrkdwn', text: `*Key message:*\n${keyMessage}` } },
      proofPoints ? { type: 'section', text: { type: 'mrkdwn', text: `*Proof points:*\n${proofPoints}` } } : null,
      culturalRelevance ? { type: 'section', text: { type: 'mrkdwn', text: `*Why now:*\n${culturalRelevance}` } } : null,
      audience ? { type: 'section', text: { type: 'mrkdwn', text: `*Target audience:*\n${audience}` } } : null,
      assets ? { type: 'section', text: { type: 'mrkdwn', text: `*Assets:*\n${assets}` } } : null,
      context ? { type: 'section', text: { type: 'mrkdwn', text: `*Additional context:*\n${context}` } } : null,
      { type: 'divider' },
      { type: 'section', text: { type: 'mrkdwn', text: `_Our PR specialist will review this and post the full strategy + Notion link here shortly._` } }
    ].filter(Boolean);

    const slackRes = await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, text: `New PR Brief — ${campaignName}` })
    });

    if (!slackRes.ok) {
      const err = await slackRes.text();
      return res.status(500).json({ error: `Slack error: ${err}` });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
