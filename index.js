const qvac = require('@qvac/sdk');
const fs = require('fs');
const m = qvac["BERGAMOT_PT_EN"];
const log = { model: m.name, status: "loaded", time: new Date().toISOString() };
fs.writeFileSync('performance_log.json', JSON.stringify(log));
console.log("Model:", m.name, "Loaded. Log saved.");
