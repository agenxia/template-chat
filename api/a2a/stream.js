import { chat } from '../../lib/llm.js';

/**
 * A2A-compatible endpoint (JSON-RPC 2.0).
 * Called by the Agenxia platform via POST /api/a2a/stream
 *
 * Request:  { jsonrpc: "2.0", method: "message/send", id, params: { message: { parts: [{ text }] } } }
 * Response: { jsonrpc: "2.0", id, result: { message: { role: "agent", parts: [{ text }] } } }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jsonrpc, method, id, params } = req.body;

  if (jsonrpc !== '2.0' || method !== 'message/send') {
    return res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32600, message: 'Expected JSON-RPC 2.0 with method message/send' },
    });
  }

  const userText = params?.message?.parts?.map((p) => p.text).join('\n') || '';
  if (!userText) {
    return res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32602, message: 'No text found in message parts' },
    });
  }

  try {
    const content = await chat([{ role: 'user', content: userText }]);
    res.status(200).json({
      jsonrpc: '2.0',
      id,
      result: {
        message: {
          role: 'agent',
          parts: [{ text: content }],
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: err.message },
    });
  }
}
