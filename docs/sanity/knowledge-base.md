# Knowledge Base — Layer B

## Overview

Layer B consists of sourced knowledge documents — real publications, changelogs, RFCs, and technical reports. Unlike Layer A (structured claims), Layer B provides narrative context for the investigation agent.

## Current Knowledge Domains

### Aether Framework (baseline)
- Framework 4.2 release notes and migration guide
- Feature X zero-copy serialization specification
- Contradicting roadmap draft (superseded)

### Twitter / X Acquisition
- SEC filing confirming $44B acquisition October 2022
- BBC rebrand announcement July 2023
- Reuters deal cancellation attempt July 2022
- Bloomberg deal reinstatement October 2022
- Full acquisition timeline

### AI Model Releases (2022–2024)
- ChatGPT launch and growth milestones
- GPT-4, GPT-4o, o1 release notes
- OpenAI governance crisis November 2023
- Gemini 1.0 launch and demo controversy
- Claude 3 and Claude 3.5 Sonnet releases
- LLaMA 1 (leaked), LLaMA 2 (commercial), LLaMA 3
- Mistral 7B and Mixtral releases
- Open source LLM race timeline

### SpaceX and Space Exploration
- Starship IFT-1 through IFT-5 progression
- James Webb Space Telescope 25-year development
- Perseverance and Ingenuity Mars missions
- Boeing Starliner vs SpaceX Crew Dragon

### India Technology and Achievements
- UPI launch and 10B monthly transactions
- Reliance Jio disruption of Indian telecom
- Byju's rise to $22B and insolvency
- Chandrayaan-3 Moon south pole landing
- Aditya-L1 solar mission
- India surpassing China in population
- India 5G launch

## Adding New Knowledge

Edit `backend/services/sanity/corpus.ts` to add to the local corpus, or run `node scripts/import-to-sanity.mjs` to push to the live Sanity dataset.

For large topic additions, create a new domain import script following the pattern in `scripts/import-domains.mjs`.
