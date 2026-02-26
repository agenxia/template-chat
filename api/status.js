export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const llmUrl = process.env.LLM_API_URL || 'not configured';
  const model = process.env.LLM_MODEL || 'not configured';
  res.status(200).json({
    success: true,
    data: {
      agent_name: process.env.AGENT_NAME || '{{AGENT_NAME}}',
      status: 'running',
      timestamp: new Date().toISOString(),
      config: {
        llm_url: llmUrl.replace(/\/\/(.+?):(.+?)@/, '//$1:***@'),
        model,
        temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.MAX_TOKENS) || 2048,
      },
    },
  });
}
