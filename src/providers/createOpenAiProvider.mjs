/**
 * Creates a model caller for any server that speaks the OpenAI chat completions
 * protocol: OpenAI itself, Ollama (`http://localhost:11434/v1`), llama.cpp's
 * llama-server, vLLM, LM Studio and many hosted services.
 *
 * @param options - `baseUrl` (ending in /v1), `model`, optional `apiKey`, `maxTokens` (default 256), `timeoutMs` (default 120000).
 * @returns An async function that sends a prompt as one user message at temperature 0 and returns the reply text.
 */
export const createOpenAiProvider = ({ baseUrl, model, apiKey, maxTokens = 256, timeoutMs = 120000 }) => async (prompt) => {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({ model, temperature: 0, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const body = await response.json();
  return body.choices?.[0]?.message?.content ?? '';
};
