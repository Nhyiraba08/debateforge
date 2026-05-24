export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, userArgument, mode } = req.body;

  if (!topic || !userArgument || !mode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const systemPrompts = {
    opponent: `You are a sharp, skilled debate opponent. The user has taken a position on a topic. 
Your job is to argue the OPPOSITE side — forcefully, logically, and persuasively. 
Use real-world examples, statistics if relevant, and structured reasoning.
Be respectful but firm. Keep your counter-argument to 3–4 strong paragraphs.
Do NOT agree with the user. Challenge every weak point.`,

    judge: `You are an expert debate judge evaluating the quality of an argument.
Score the argument on a scale of 1–10 on these 4 criteria:
1. Clarity (Is the argument easy to follow?)
2. Logic (Is the reasoning sound and structured?)
3. Evidence (Are claims supported with examples or facts?)
4. Persuasiveness (Would this convince a neutral audience?)

Respond ONLY in this exact JSON format (no extra text):
{
  "scores": {
    "clarity": <number>,
    "logic": <number>,
    "evidence": <number>,
    "persuasiveness": <number>
  },
  "overall": <average of the 4 scores, one decimal>,
  "strengths": "<2 sentences on what was done well>",
  "improvements": "<2 sentences on what could be stronger>",
  "verdict": "<one punchy sentence overall verdict>"
}`,
  };

  const userMessages = {
    opponent: `Topic: "${topic}"\n\nThe user argues:\n"${userArgument}"\n\nNow argue the opposite side powerfully.`,
    judge: `Topic: "${topic}"\n\nArgument to evaluate:\n"${userArgument}"\n\nScore and give feedback.`,
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

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || "API error" });
    }

    const data = await response.json();
    const text = data.content[0]?.text || "";

    if (mode === "judge") {
      try {
        const parsed = JSON.parse(text);
        return res.status(200).json({ result: parsed, mode });
      } catch {
        return res.status(200).json({ result: text, mode, raw: true });
      }
    }

    return res.status(200).json({ result: text, mode });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
}
