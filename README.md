# {{AGENT_NAME}}

{{AGENT_DESCRIPTION}}

## Quick Start

Configure the environment variables for your LLM provider:

**OpenAI:**
\`\`\`
LLM_API_URL=https://api.openai.com
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o
\`\`\`

**Anthropic:**
\`\`\`
LLM_API_URL=https://api.anthropic.com
LLM_API_KEY=sk-ant-...
LLM_MODEL=claude-sonnet-4-20250514
\`\`\`

**Ollama (local):**
\`\`\`
LLM_API_URL=http://localhost:11434
LLM_MODEL=llama3.3
\`\`\`

**Together AI / Groq / Mistral / etc.:**
\`\`\`
LLM_API_URL=https://api.together.xyz
LLM_API_KEY=...
LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
\`\`\`

## Endpoints

- \`GET /api/status\` — Agent health & configuration
- \`POST /api/chat\` — Direct chat endpoint
- \`POST /api/a2a/stream\` — A2A protocol (JSON-RPC 2.0)

### POST /api/chat

\`\`\`json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
\`\`\`

Response:
\`\`\`json
{
  "message": { "role": "assistant", "content": "Hello! How can I help?" }
}
\`\`\`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| LLM_API_URL | Yes | — | Base URL of the LLM API |
| LLM_API_KEY | No | — | API key (not needed for Ollama) |
| LLM_MODEL | Yes | gpt-3.5-turbo | Model identifier |
| SYSTEM_PROMPT | No | — | Default system prompt |
| TEMPERATURE | No | 0.7 | Sampling temperature |
| MAX_TOKENS | No | 2048 | Max response tokens |

## How it works

The agent auto-detects the provider format from \`LLM_API_URL\`:
- URL contains \`anthropic\` → Anthropic Messages API format
- URL contains \`ollama\` or \`localhost:11434\` → Ollama format
- Everything else → OpenAI-compatible format (OpenAI, Together, Groq, Mistral, etc.)
