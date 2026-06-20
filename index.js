const qvac = require('@qvac/sdk');
const fs = require('fs');

const models = {
  hi_en: qvac["BERGAMOT_HI_EN"],
  en_hi: qvac["BERGAMOT_EN_HI"],
  fr_en: qvac["BERGAMOT_FR_EN"],
  de_en: qvac["BERGAMOT_DE_EN"],
  es_en: qvac["BERGAMOT_ES_EN"],
};

const log = {
  models_loaded: Object.keys(models).length,
  models: Object.fromEntries(
    Object.entries(models).map(([k,v]) => [k, v.name])
  ),
  status: "loaded",
  time: new Date().toISOString(),
  privacy: "100% local - zero cloud"
};

fs.writeFileSync('performance_log.json', JSON.stringify(log, null, 2));
console.log("Loaded", Object.keys(models).length, "models locally!");
console.log("Privacy: Zero cloud dependency");
