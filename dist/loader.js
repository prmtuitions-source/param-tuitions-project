// Loader to avoid inline module injection by Vite dev server.
// Imports the Vite HMR client and the application entry module as external scripts.
import '/@vite/client';
import '/src/index.js';

// Note: keep this file in /public so it's served as a static module and
// referenced via <script type="module" src="/loader.js"></script> in index.html
