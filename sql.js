const sql = require("mssql");
// config for your database
const config = {
  user: "sa",
  password: "6k3vddrb2vGnusmaS",
  server: "localhost",
  database: "tr_analitics",
  options: {
    encrypt: false, // for azure
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};
module.exports.sql = sql;
module.exports.config = config;
