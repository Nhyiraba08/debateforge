module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { topic, userArgument, mode } = req.body || {};

  if (!topic || !userArgument || !mode) {
    return res.status(400).json({ error: "Missing fields: topic, userArgument, mode" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key not configured on server" });
  }

  const systemPrompts = {
    opponent: `You are a sharp debate opponent. The user has taken a position on a topic.
Argue the OPPOSITE side forcefully, logically, and persuasively.
Use real examples and structured reasoning. Be firm but respectful.
Write 3-4 strong paragraphs only.`,

    judge: `You are an expert debate judge. Score the argument on 4 criteria (1-10 each):
Clarity, Logic, Evidence, Persuasiveness.

Reply ONLY with this JSON, no extra text:
{
  "scores": { "clarity": 7, "logic": 6, "evidence": 5, "persuasiveness": 7 },
  "overall": 6.3,
  "strengths": "Two sentences on strengths.",
  "improvements": "Two sentences on what to improve.",
  "verdict": "One punchy sentence verdict."
}`,
  };

  const userMessages = {
    opponent: `Topic: "${topic}"\nUser argues: "${userArgument}"\nNow argue the opposite side powerfully.`,
    judge: `Topic: "${topic}"\nArgument: "${userArgument}"\nScore and give feedback.`,
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompts[mode],
        messages: [{ role: "user", content: userMessages[mode] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
      return res.status(500).json({ error: data.error?.message || "Anthropic API error" });
    }

    const text = data.content?.[0]?.text || "";

    if (mode === "judge") {
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        return res.status(200).json({ result: parsed, mode });
      } catch {
        return res.status(200).json({ result: text, mode, raw: true });
      }
    }

    return res.status(200).json({ result: text, mode });

  } catch (error) {
    console.error("Handler error:", error.message);
    return res.status(500).json({ error: "Server error: " + error.message });
  }
};
