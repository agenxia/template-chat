/**
 * Generic LLM router — auto-detects provider format from LLM_API_URL.
 *
 * Supported formats:
 * - Anthropic (Messages API): URL contains "anthropic"
 * - Ollama: URL contains "ollama" or "localhost:11434"
 * - OpenAI-compatible (default): everything else (OpenAI, Together, Mistral, Groq, etc.)
 *
 * Zero SDK — only fetch().
 */

function detectProvider(url) {
  const lower = url.toLowerCase();
  if (lower.includes('anthropic')) return 'anthropic';
  if (lower.includes('ollama') || lower.includes('localhost:11434') || lower.includes('127.0.0.1:11434')) return 'ollama';
  return 'openai';
}

function buildAnthropicRequest(messages, model, temperature, maxTokens, apiKey) {
  const systemMessages = messages.filter((m) => m.role === 'system');
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');
  const systemPrompt = systemMessages.map((m) => m.content).join('\n') || undefined;
  return {
    url: process.env.LLM_API_URL.replace(/\/$/, '') + '/v1/messages',
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: nonSystemMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    },
    parseResponse: (data) => data.content?.[0]?.text || '',
  };
}

function buildOllamaRequest(messages, model, temperature, maxTokens) {
  return {
    url: process.env.LLM_API_URL.replace(/\/$/, '') + '/api/chat',
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        options: { temperature, num_predict: maxTokens },
      }),
    },
    parseResponse: (data) => data.message?.content || '',
  };
}

function buildOpenAIRequest(messages, model, temperature, maxTokens, apiKey) {
  return {
    url: process.env.LLM_API_URL.replace(/\/$/, '') + '/v1/chat/completions',
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens,
      }),
    },
    parseResponse: (data) => data.choices?.[0]?.message?.content || '',
  };
}

export async function chat(userMessages) {
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY || '';
  const model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
  const temperature = parseFloat(process.env.TEMPERATURE) || 0.7;
  const maxTokens = parseInt(process.env.MAX_TOKENS) || 2048;
  const systemPrompt = process.env.SYSTEM_PROMPT || '';

  if (!apiUrl) {
    throw new Error('LLM_API_URL is not configured');
  }

  // Prepend system prompt if set
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push(...userMessages);

  const provider = detectProvider(apiUrl);
  let request;
  switch (provider) {
    case 'anthropic':
      request = buildAnthropicRequest(messages, model, temperature, maxTokens, apiKey);
      break;
    case 'ollama':
      request = buildOllamaRequest(messages, model, temperature, maxTokens);
      break;
    default:
      request = buildOpenAIRequest(messages, model, temperature, maxTokens, apiKey);
  }

  const response = await fetch(request.url, request.options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return request.parseResponse(data);
}
