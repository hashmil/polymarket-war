import { readFile, writeFile } from "fs/promises";
import path from "path";

interface MarketData {
  question: string;
  outcomes: [string, string];
  outcomePrices: [number, number];
  volume: number;
  groupItemTitle?: string;
}

interface EventData {
  slug: string;
  title: string;
  markets: MarketData[];
}

interface Snapshot {
  fetchedAt: string;
  events: EventData[];
}

function yesPrice(m: MarketData): number {
  const idx = m.outcomes.indexOf("Yes");
  return idx === -1 ? m.outcomePrices[0]! : m.outcomePrices[idx]!;
}

function formatOddsForPrompt(snapshot: Snapshot): string {
  let out = "";
  for (const event of snapshot.events) {
    out += `\n${event.title}:\n`;
    for (const m of event.markets) {
      const pct = Math.round(yesPrice(m) * 100);
      const vol = m.volume >= 1_000_000
        ? `$${(m.volume / 1_000_000).toFixed(1)}M`
        : `$${(m.volume / 1_000).toFixed(0)}K`;
      const label = m.groupItemTitle || m.question;
      out += `  - ${label}: ${pct}% (${vol} volume)\n`;
    }
  }
  return out;
}

async function main() {
  const dataDir = path.join(import.meta.dir, "..", "data");
  const latestPath = path.join(dataDir, "latest.json");
  const analysisPath = path.join(dataDir, "analysis.json");

  let snapshot: Snapshot;
  try {
    snapshot = JSON.parse(await readFile(latestPath, "utf-8"));
  } catch {
    console.error("No latest.json found. Run 'bun run fetch' first.");
    process.exit(1);
  }

  const oddsText = formatOddsForPrompt(snapshot);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const prompt = `You are a geopolitical analyst writing a brief market intelligence summary about the Iran conflict for ${today}.

Here are the current Polymarket prediction market odds (fetched just now):
${oddsText}

Use web search to find the latest Iran conflict news and developments from the past 48 hours. Search for terms like "Iran war", "Iran ceasefire", "Iran US conflict", "Polymarket Iran".

Write 4-6 concise bullet points. Each bullet should be 1-2 sentences. Cover:
- What the current odds imply about the conflict trajectory and timeline
- Key recent news developments driving the market
- Any notable or surprising market movements
- Cross-reference with other sources if possible (Metaculus, analyst views, news)
- Brief outlook

CRITICAL FORMAT RULES:
- Start each bullet with "• " (bullet character + space)
- Output ONLY the bullet points — no title, no headline, no preamble, no "Here's..." intro
- Do NOT use markdown headers or bold titles before the bullets
- After the bullets, add a blank line then "Sources:" followed by source links as "- [title](url)"
- Be direct and analytical. Write like a Bloomberg terminal note.`;

  console.log("Running AI analysis via claude CLI...");

  try {
    const proc = Bun.spawn(
      [
        "claude",
        "-p",
        prompt,
        "--allowedTools",
        "WebSearch,WebFetch",
        "--output-format",
        "text",
      ],
      {
        stdout: "pipe",
        stderr: "pipe",
        timeout: 120_000,
      }
    );

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      console.error("claude CLI failed:", stderr);
      throw new Error(`Exit code ${exitCode}`);
    }

    const analysis = stdout.trim();
    console.log("\nAnalysis generated:\n");
    console.log(analysis);

    await writeFile(
      analysisPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          analysis,
        },
        null,
        2
      )
    );

    console.log("\nSaved to data/analysis.json");
  } catch (err) {
    console.error("Analysis generation failed, writing fallback:", err);
    await writeFile(
      analysisPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          analysis: null,
        },
        null,
        2
      )
    );
  }
}

main();
