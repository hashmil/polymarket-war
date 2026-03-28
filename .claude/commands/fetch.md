Fetch the latest Polymarket odds and generate AI analysis. Run these steps:

1. Run `bun run fetch` to pull latest odds from Polymarket Gamma API
2. Run `bun run analyze` to generate AI analysis via claude CLI with web search
3. Show a summary of the key odds from `data/latest.json` (ceasefire dates and percentages)
4. Run `git add data/ && git commit -m 'odds update' && git push` to deploy
