# QVAC-PrivacyVault 🔒

A local-first, privacy-preserving multilingual AI translation web app built for the **QVAC Hackathon I — Unleash Edge AI**.

100% on-device inference via the [`@qvac/sdk`](https://www.npmjs.com/package/@qvac/sdk) — zero cloud dependency, zero per-request cost, zero data leaving your device.

## What it does

A simple, clean web dashboard where you pick a language pair, type text, and get a translation - computed entirely on your own machine using QVAC's Bergamot neural machine translation engine. No API keys, no internet round-trip after the model is cached locally.

## Why this matters

Translation tools today send your text to a third-party server. For sensitive content - medical notes, legal documents, personal messages - that is a privacy risk most people do not think about. QVAC-PrivacyVault proves you do not need the cloud to get fast, accurate translation.

## Tech stack

- @qvac/sdk - on-device inference (loadModel, translate)
- Bergamot NMT models - small (~20MB), fast, dedicated translation models
- Express.js - thin local server, no external services
- Vanilla JS/HTML - zero frontend framework overhead

## Supported language pairs

| From | To |
|------|-----|
| Hindi | English |
| English | Hindi |
| French | English |
| German | English |
| Spanish | English |

## Setup

Requirements: Node.js >= 22.17, Linux/macOS/WSL with Vulkan available (or libvulkan1 + mesa-vulkan-drivers on Debian/Ubuntu).

    git clone https://github.com/yogeshkampalliwar/QVAC-PrivacyVault
    cd QVAC-PrivacyVault
    npm install
    node server.js

Open http://localhost:3000 in your browser.

First translation for a language pair will download the model (~20MB) and cache it locally - every subsequent call is instant and fully offline.

## Example (verified working output)

    curl -X POST http://localhost:3000/api/translate \
      -H "Content-Type: application/json" \
      -d '{"text":"Privacy matters to everyone","modelKey":"en_hi"}'

Response:

    {
      "translatedText": "गोपनीयता सभी के लिए मायने रखती है",
      "privacy": "100% local inference - zero cloud calls made",
      "modelUsed": "en_hi"
    }

## Hardware tested on

- GitHub Codespaces (2-core, CPU-only, Ubuntu 24.04) with Vulkan
- Android via Termux (development/prototyping)

No GPU required. CPU inference confirmed working.

## Privacy guarantee

- No API keys
- No outbound translation requests once models are cached
- No analytics, no tracking
- All inference happens via local loadModel/translate calls from @qvac/sdk

## QVAC Hackathon compliance

- All inference uses @qvac/sdk
- Fully open-source (Apache 2.0)
- Reproducible setup documented above
- QVAC Discord community member

## License

Apache 2.0
