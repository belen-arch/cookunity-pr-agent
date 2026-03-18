module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { submitterName, email, campaignName, type, keyMessage, proofPoints, culturalRelevance, spokesperson, audience, markets, priority, launchDate, assets, context } = req.body;
    if (!campaignName || !keyMessage) return res.status(400).json({ error: 'Campaign name and key message are required.' });

    const text = [
      `📋 *New PR Brief — ${campaignName}*`,
      ``,
      `*Submitted by:* ${submitterName}${email ? ' (' + email + ')' : ''}`,
      `*Type:* ${type || 'Not specified'}`,
      `*Priority:* ${priority || 'Not specified'}`,
      `*Markets:* ${markets || 'National'}`,
      `*Spokesperson:* ${spokesperson || 'Not specified'}`,
      `*Launch date:* ${launchDate || 'Not specified'}`,
      ``,
      `*Key message:*`,
      keyMessage,
      proofPoints ? `\n*Proof points:*\n${proofPoints}` : '',
      culturalRelevance ? `\n*Why now:*\n${culturalRelevance}` : '',
      audience ? `\n*Target audience:*\n${audience}` : '',
      assets ? `\n*Assets:*\n${assets}` : '',
      context ? `\n*Additional context:*\n${context}` : '',
      ``,
      `_Our PR specialist will review this and post the full strategy + Notion link here shortly._`
    ].filter(l => l !== undefined).join('\n');

    const slackRes = await fetch('https://hooks.slack.com/services/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', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const response = await slackRes.text();
    if (response !== 'ok') return res.status(500).json({ error: `Slack error: ${response}` });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
