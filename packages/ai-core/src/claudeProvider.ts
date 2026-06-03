import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function claudeProvider(prompt: string): Promise<string> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return block.text;
}
