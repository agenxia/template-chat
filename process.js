export default async function process(inputs, { llm, config }) {
  const { message, context } = inputs;
  if (!message) return { response: 'No message provided' };
  
  const messages = [];
  if (Array.isArray(context)) {
    messages.push(...context);
  }
  messages.push({ role: 'user', content: message });

  if (llm) {
    const result = await llm.chat(messages);
    return { response: result.content };
  }
  return { response: `Echo: ${message}` };
}