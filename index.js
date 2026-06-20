const qvac = require('@qvac/sdk');
const fs = require('fs');

console.log("QVAC-PrivacyVault: Local AI Demo");
console.log("================================");

const models = {
  hi_en: qvac["BERGAMOT_HI_EN"],
  en_hi: qvac["BERGAMOT_EN_HI"],
  fr_en: qvac["BERGAMOT_FR_EN"],
  de_en: qvac["BERGAMOT_DE_EN"],
  es_en: qvac["BERGAMOT_ES_EN"],
};

console.log("\nModels Available (Local Only):");
Object.entries(models).forEach(function(entry) {
  console.log("  " + entry[0] + ": " + entry[1].name + " [" + entry[1].engine + "]");
});

const log = {
  project: "QVAC-PrivacyVault",
  models_loaded: Object.keys(models).length,
  models: Object.fromEntries(
    Object.entries(models).map(function(e) {
      return [e[0], { name: e[1].name, engine: e[1].engine, params: e[1].params }];
    })
  ),
  privacy: "100% local - zero cloud dependency",
  hardware: "Mobile/CPU inference",
  timestamp: new Date().toISOString()
};

fs.writeFileSync('performance_log.json', JSON.stringify(log, null, 2));
console.log("\nPrivacy: Zero cloud dependency");
console.log("All models run locally on device!");
console.log("\nLog saved to performance_log.json");
