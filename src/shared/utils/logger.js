// Lightweight logger that silences output in production
const enabled = process.env.NODE_ENV !== 'production';

export const log = (...args) => { if (enabled) console.log(...args); };
export const warn = (...args) => { if (enabled) console.warn(...args); };
export const error = (...args) => { if (enabled) console.error(...args); };
export default { log, warn, error };
