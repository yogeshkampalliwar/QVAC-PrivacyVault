# QVAC-PrivacyVault 🔒

A local-first, privacy-preserving multilingual AI translation web app built for the **QVAC Hackathon I — Unleash Edge AI**.

100% on-device inference via the [`@qvac/sdk`](https://www.npmjs.com/package/@qvac/sdk) — zero cloud dependency, zero per-request cost, zero data leaving your device.

## What it does

A web dashboard where you pick a language pair, type text, and get a translation, computed entirely on your own machine using QVAC's Bergamot neural machine translation engine. No API keys, no internet round-trip after the model is cached locally.

Beyond simple translation, the app runs a second on-device model (Llama 3.2 1B Instruct) to analyze the tone and context of the translated message, still 100% local. This is a real two-stage local AI pipeline: a specialized NMT engine for translation accuracy, handed off to a small local LLM for reasoning, with zero data ever leaving the device.

## Why this matters

Translation tools today send your text to a third-party server. For sensitive content such as medical notes, legal documents, or personal messages, that is a privacy risk most people do not think about. QVAC-PrivacyVault proves you do not need the cloud to get fast, accurate translation plus AI reasoning.

## Tech stack

- @qvac/sdk for on-device inference: loadModel, translate, completion
- Bergamot NMT models, small (about 20MB), fast, dedicated translation models
- Llama 3.2 1B Instruct (Q4_0 quantized), local LLM for context and tone analysis, CPU-only
- Express.js, a thin local server with no external services
- Vanilla JS/HTML, zero frontend framework overhead

## Pipeline

    User text
      -> Bergamot NMT (translation)
      -> Llama 3.2 1B (tone/context analysis of the translation)
      -> Result + live performance stats (tokens/sec, backend device)

Both models load and run entirely on-device. Verified CPU-only inference at roughly 18 tokens/sec on a 2-core cloud VM, no GPU required.

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

First translation for a language pair downloads the Bergamot model (about 20MB) and caches it locally. The first context analysis call downloads the Llama 3.2 1B model (about 800MB). Every subsequent call is instant and fully offline.

## Example (verified working output)

Translation:

    curl -X POST http://localhost:3000/api/translate \
      -H "Content-Type: application/json" \
      -d '{"text":"Privacy matters to everyone","modelKey":"en_hi"}'

Response:

    {
      "translatedText": "गोपनीयता सभी के लिए मायने रखती है",
      "privacy": "100% local inference - zero cloud calls made",
      "modelUsed": "en_hi"
    }

Context analysis (second model in the pipeline):

    curl -X POST http://localhost:3000/api/explain \
      -H "Content-Type: application/json" \
      -d '{"originalText":"I am so happy to see you!","translatedText":"मुझे आपको देखकर बहुत खुशी हुई!","fromLang":"English","toLang":"Hindi"}'

Response:

    {
      "explanation": "The tone is casual and friendly.",
      "privacy": "100% local inference - zero cloud calls made",
      "modelUsed": "LLAMA_3_2_1B_INST_Q4_0",
      "pipeline": "Bergamot NMT -> Llama 3.2 1B (both on-device)",
      "performance": {
        "tokensPerSecond": 17.96,
        "timeToFirstTokenMs": 2734.03,
        "backendDevice": "cpu"
      }
    }

## Hardware tested on

- GitHub Codespaces (2-core, CPU-only, Ubuntu 24.04) with Vulkan
- Android via Termux (development/prototyping)

No GPU required. CPU inference confirmed working for both the translation engine and the LLM.

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
- Two distinct QVAC model families used: Bergamot (translation) and Llama 3.2 (completion/reasoning)

## License

Apache 2.0
