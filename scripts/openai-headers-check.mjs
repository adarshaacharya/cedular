// Simple sanity check to compare OpenAI response headers (project/org/request-id)
// between local and deployed environments.
//
// Usage:
//   OPENAI_API_KEY=... node scripts/openai-headers-check.mjs
//   # or if you use .env locally:
//   node -r dotenv/config scripts/openai-headers-check.mjs

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY in environment.");
  process.exit(1);
}

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

const res = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    input: "ping",
    max_output_tokens: 16,
  }),
});

const pick = (k) => res.headers.get(k) ?? "";

console.log("OpenAI HTTP:", res.status);
console.log("model:", model);
console.log("x-request-id:", pick("x-request-id"));
console.log("openai-project:", pick("openai-project"));
console.log("openai-organization:", pick("openai-organization"));
console.log("openai-processing-ms:", pick("openai-processing-ms"));
console.log("date:", pick("date"));

if (!res.ok) {
  const text = await res.text().catch(() => "");
  console.log("body:", text);
  process.exit(2);
}

// Drain body so Node doesn't complain about an unconsumed stream in some setups.
await res.text().catch(() => "");
