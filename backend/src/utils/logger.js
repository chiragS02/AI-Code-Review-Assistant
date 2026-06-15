const env = require("../config/env");

function write(level, method, args) {
  method(`[${level}]`, new Date().toISOString(), ...args);
}

module.exports = {
  info: (...args) => write("INFO", console.warn, args),
  warn: (...args) => write("WARN", console.warn, args),
  error: (...args) => write("ERROR", console.error, args),
  isProduction: env.nodeEnv === "production",
};