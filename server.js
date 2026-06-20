import express from "express";
import { loadModel, translate, unloadModel, BERGAMOT_HI_EN, BERGAMOT_EN_HI, BERGAMOT_FR_EN, BERGAMOT_DE_EN, BERGAMOT_ES_EN } from "@qvac/sdk";

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

app.listen(3000, () => console.log("QVAC PrivacyVault running on http://localhost:3000"));
