import express from "express";
import { loadModel, translate, completion, unloadModel, BERGAMOT_HI_EN, BERGAMOT_EN_HI, BERGAMOT_FR_EN, BERGAMOT_DE_EN, BERGAMOT_ES_EN, LLAMA_3_2_1B_INST_Q4_0 } from "@qvac/sdk";

const app = express();
app.use(express.json());
app.use(express.static("."));
app.get("/", (req, res) => res.sendFile(process.cwd() + "/dashboard.html"));

const MODELS = {
  hi_en: { src: BERGAMOT_HI_EN, from: "hi", to: "en" },
  en_hi: { src: BERGAMOT_EN_HI, from: "en", to: "hi" },
  fr_en: { src: BERGAMOT_FR_EN, from: "fr", to: "en" },
  de_en: { src: BERGAMOT_DE_EN, from: "de", to: "en" },
  es_en: { src: BERGAMOT_ES_EN, from: "es", to: "en" },
};

const loadedModels = {};
let llmModelId = null;

async function ensureLlm() {
  if (!llmModelId) {
    console.log("Loading local LLM (Llama 3.2 1B) for context explanation...");
    llmModelId = await loadModel({
      modelSrc: LLAMA_3_2_1B_INST_Q4_0,
      modelConfig: { ctx_size: 2048 },
    });
    console.log(`LLM loaded: ${llmModelId}`);
  }
  return llmModelId;
}

app.post("/api/translate", async (req, res) => {
  try {
    const { text, modelKey } = req.body;
    const config = MODELS[modelKey];
    if (!config) return res.status(400).json({ error: "Unknown model: " + modelKey });

    if (!loadedModels[modelKey]) {
      console.log(`Loading ${modelKey} model locally...`);
      loadedModels[modelKey] = await loadModel({
        modelSrc: config.src,
        modelConfig: {
          engine: "Bergamot",
          from: config.from,
          to: config.to,
          beamsize: 1,
          normalize: 1,
          temperature: 0.2,
          norepeatngramsize: 3,
          lengthpenalty: 1.2,
        },
      });
      console.log(`Model ${modelKey} loaded: ${loadedModels[modelKey]}`);
    }

    const result = translate({
      modelId: loadedModels[modelKey],
      text,
      modelType: "nmtcpp-translation",
      stream: false,
    });

    const translatedText = await result.text;

    res.json({
      translatedText,
      privacy: "100% local inference - zero cloud calls made",
      modelUsed: modelKey,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/explain", async (req, res) => {
  try {
    const { originalText, translatedText, fromLang, toLang } = req.body;
    if (!translatedText) return res.status(400).json({ error: "translatedText required" });

    const modelId = await ensureLlm();

    const prompt = `You translated this text from ${fromLang} to ${toLang}:\nOriginal: "${originalText}"\nTranslation: "${translatedText}"\n\nIn one short sentence, describe the tone or context of this message (e.g. formal, casual, urgent, friendly). Be brief.`;

    const run = completion({
      modelId,
      history: [{ role: "user", content: prompt }],
      generationParams: { predict: 60 },
      stream: false,
    });

    const final = await run.final;

    res.json({
      explanation: final.contentText,
      privacy: "100% local inference - zero cloud calls made",
      modelUsed: "LLAMA_3_2_1B_INST_Q4_0",
      pipeline: "Bergamot NMT -> Llama 3.2 1B (both on-device)",
      performance: {
        tokensPerSecond: final.stats?.tokensPerSecond,
        timeToFirstTokenMs: final.stats?.timeToFirstToken,
        backendDevice: final.stats?.backendDevice,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("QVAC PrivacyVault running on http://localhost:3000"));
