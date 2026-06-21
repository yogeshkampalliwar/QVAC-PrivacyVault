# QVAC-PrivacyVault 🔒

A local-first, privacy-preserving multilingual AI app built for the **QVAC Hackathon I — Unleash Edge AI**.

100% on-device inference via the [`@qvac/sdk`](https://www.npmjs.com/package/@qvac/sdk), zero cloud dependency, zero per-request cost, zero data leaving your device.

## What it does

A three-stage local AI pipeline, all running on your own machine:

1. **Translate** a message between language pairs using a dedicated NMT engine (Bergamot)
2. **Analyze tone and context** of the translation using a small local LLM (Llama 3.2 1B)
3. **Detect action items** in the message using a tool-calling agent (Qwen3 1.7B), which extracts structured data like reminders and urgency flags

Three different QVAC model families, three different jobs, one fully local pipeline. No API keys, no internet round-trip after models are cached, no data ever leaves the device.

## Why this matters

Translation tools today send your text to a third-party server. For sensitive content such as medical notes, legal documents, or personal messages, that is a privacy risk most people do not think about. QVAC-PrivacyVault proves you do not need the cloud to get fast translation, AI reasoning, and agentic action detection.

## Tech stack

- @qvac/sdk for on-device inference: loadModel, translate, completion (with tool calling)
- Bergamot NMT models, small (about 20MB), fast, dedicated translation models
- Llama 3.2 1B Instruct (Q4_0), local LLM for context and tone analysis, CPU-only
- Qwen3 1.7B Instruct (Q4), local tool-calling agent for structured action detection, CPU-only
- Express.js, a thin local server with no external services
- Vanilla JS/HTML, zero frontend framework overhead

## Pipeline

    User text
      -> Bergamot NMT (translation)
      -> Llama 3.2 1B (tone/context analysis of the translation)
      -> Qwen3 1.7B + tool calling (detects reminders and urgent items, returns structured data)
      -> Result + live performance stats at every stage

All three models load and run entirely on-device. Verified CPU-only inference, no GPU required.

## Supported language pairs

| From | To |
|------|-----|
| Hindi | English |
| English | Hindi |
| French | English |
| German | English |
| Spanish | English |

(Easily extendable, QVAC ships 100+ Bergamot model pairs.)

## Setup

Requirements: Node.js 22.17 or newer, Linux/macOS/WSL with Vulkan available (or libvulkan1 + mesa-vulkan-drivers on Debian/Ubuntu).

    git clone https://github.com/yogeshkampalliwar/QVAC-PrivacyVault
    cd QVAC-PrivacyVault
    npm install
    node server.js

Open http://localhost:3000 in your browser.

Models download and cache locally on first use: Bergamot (about 20MB per language pair), Llama 3.2 1B (about 800MB), Qwen3 1.7B (about 1GB). Every subsequent call is instant and fully offline.

## Example (verified working output)

### Stage 1: Translation

    curl -X POST http://localhost:3000/api/translate \
      -H "Content-Type: application/json" \
      -d '{"text":"Privacy matters to everyone","modelKey":"en_hi"}'

    {
      "translatedText": "गोपनीयता सभी के लिए मायने रखती है",
      "privacy": "100% local inference - zero cloud calls made",
      "modelUsed": "en_hi"
    }

### Stage 2: Context analysis

    curl -X POST http://localhost:3000/api/explain \
      -H "Content-Type: application/json" \
      -d '{"originalText":"I am so happy to see you!","translatedText":"मुझे आपको देखकर बहुत खुशी हुई!","fromLang":"English","toLang":"Hindi"}'

    {
      "explanation": "The tone is casual and friendly.",
      "modelUsed": "LLAMA_3_2_1B_INST_Q4_0",
      "performance": { "tokensPerSecond": 17.96, "backendDevice": "cpu" }
    }

### Stage 3: Tool-calling agent

    curl -X POST http://localhost:3000/api/agent \
      -H "Content-Type: application/json" \
      -d '{"translatedText":"Remember to call the doctor tomorrow at 3pm"}'

    {
      "detectedActions": [
        {
          "tool": "set_reminder",
          "arguments": { "task": "call the doctor", "when": "tomorrow at 3pm" },
          "result": { "status": "reminder_created", "task": "call the doctor", "when": "tomorrow at 3pm" }
        }
      ],
      "actionCount": 1,
      "modelUsed": "QWEN3_1_7B_INST_Q4",
      "performance": { "tokensPerSecond": 11.49, "backendDevice": "cpu" }
    }

## Hardware tested on

- GitHub Codespaces (2-core, CPU-only, Ubuntu 24.04) with Vulkan
- Android via Termux (development/prototyping)

No GPU required. CPU inference confirmed working for all three models in the pipeline.

## Privacy guarantee

- No API keys
- No outbound requests once models are cached
- No analytics, no tracking
- All inference happens via local loadModel/translate/completion calls from @qvac/sdk

## QVAC Hackathon compliance

- All inference uses @qvac/sdk
- Fully open-source (Apache 2.0)
- Reproducible setup documented above
- QVAC Discord community member
- Three distinct QVAC model families used: Bergamot (NMT), Llama 3.2 (completion/reasoning), Qwen3 (tool calling)
- Demonstrates structured tool calling / agentic capability, not just plain text generation

## License

Apache 2.0

## Demo Video

🎥 [Watch the demo](https://youtube.com/shorts/DunUaL2JzkQ?si=WqVzUBHvGKTOsRro)

The video shows:
- Live translation demo (English ↔ Hindi)
- Tone/context analysis using a local LLM
- Tool-calling agent detecting reminders and action items
- Real-time performance stats (tokens/sec, latency) shown on-screen
- 100% local inference — no internet calls made

## Multi-Agent Architecture

QVAC-PrivacyVault uses a **3-agent orchestrated pipeline**, not a single monolithic model call:

| Agent | Role | Model |
|-------|------|-------|
| **Agent 1: Translation Agent** | Converts text between language pairs | Bergamot NMT |
| **Agent 2: Context Agent** | Analyzes tone and intent of translated text | Llama 3.2 1B Instruct |
| **Agent 3: Action Agent** | Detects actionable items via structured tool calling | Qwen3 1.7B Instruct |

The Express.js server acts as the **orchestrator**, routing data sequentially between agents and aggregating results with live performance telemetry at each stage. This demonstrates multi-agent workflow capability with real tool-calling (not plain text generation) entirely on-device.

