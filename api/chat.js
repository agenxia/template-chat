import { chat } from '../lib/llm.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID, X-Agent-ID');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, user } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const userId = user || req.headers['x-user-id'] || '';

  try {
    const content = await chat(messages, { userId });
    res.status(200).json({
      message: { role: 'assistant', content },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}