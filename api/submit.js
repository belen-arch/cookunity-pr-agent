const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL = 'C0AMSG4B6Q1';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { submitterName, email, campaignName, type, keyMessage, proofPoints, culturalRelevance, spokesperson, audience, markets, priority, launchDate, assets, context } = req.body;

    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `📋 New PR Brief — ${campaignName}`, emoji: true }
      },
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
      assets ? { type: 'section', text: { type: 'mrkdwn', text: `*Assets available:*\n${assets}` } } : null,
      context ? { type: 'section', text: { type: 'mrkdwn', text: `*Additional context:*\n${context}` } } : null,
      { type: 'divider' },
      { type: 'section', text: { type: 'mrkdwn', text: `_Our PR specialist will generate the full strategy and post the Notion link here shortly._` } }
    ].filter(Boolean);

    const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify({ channel: SLACK_CHANNEL, blocks, text: `New PR Brief — ${campaignName}` })
    });

    const slackData = await slackRes.json();
    if (!slackData.ok) return res.status(500).json({ error: `Slack error: ${slackData.error}` });

    return res.status(200).json({ ok: true, ts: slackData.ts });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
