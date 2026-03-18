const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DB_ID = '26b08a0c-6811-4536-8391-594c571035b3';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { submitterName, email, campaignName, type, keyMessage, proofPoints, culturalRelevance, spokesperson, audience, markets, priority, launchDate, assets, context } = req.body;
    if (!campaignName || !keyMessage) return res.status(400).json({ error: 'Campaign name and key message are required.' });

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB_ID },
        properties: {
          'Campaign Name': { title: [{ text: { content: campaignName } }] },
          'Submitted By': { rich_text: [{ text: { content: submitterName || '' } }] },
          'Email': { email: email || null },
          'Announcement Type': type ? { select: { name: type } } : undefined,
          'PR Priority': priority ? { select: { name: priority } } : undefined,
          'Market Scope': { rich_text: [{ text: { content: markets || 'National' } }] },
          'Spokesperson': { rich_text: [{ text: { content: spokesperson || '' } }] },
          'Key Message': { rich_text: [{ text: { content: keyMessage.slice(0, 2000) } }] },
          'Proof Points': { rich_text: [{ text: { content: (proofPoints || '').slice(0, 2000) } }] },
          'Cultural Relevance': { rich_text: [{ text: { content: (culturalRelevance || '').slice(0, 2000) } }] },
          'Target Audience': { rich_text: [{ text: { content: (audience || '').slice(0, 2000) } }] },
          'Assets Available': assets ? { select: { name: assets } } : undefined,
          'Additional Context': { rich_text: [{ text: { content: (context || '').slice(0, 2000) } }] },
          'Status': { select: { name: 'Brief submitted' } },
          ...(launchDate ? { 'Launch Date': { date: { start: launchDate } } } : {})
        }
      })
    });

    const data = await notionRes.json();
    if (data.object === 'error') return res.status(500).json({ error: `Notion error: ${data.message}` });

    return res.status(200).json({ ok: true, notionPageUrl: data.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
