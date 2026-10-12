// A tiny static server for the fixtures (tests use it; run it by hand to look at them:
// node fixtures/serve.mjs, then open http://127.0.0.1:4321/hit-area/before.html).

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
export const FIXTURES = fileURLToPath(new URL('.', import.meta.url));

export function serve(root = FIXTURES, port = 0) {
  const base = resolve(root);
  const server = createServer(async (req, res) => {
    const path = resolve(base, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!path.startsWith(base + sep) && path !== base) { res.writeHead(403); res.end(); return; }
    try {
      const body = await readFile(path.endsWith(sep) || path === base ? join(path, 'index.html') : path);
      res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found'); }
  });
  return new Promise(done => server.listen(port, '127.0.0.1', () => done({
    url: `http://127.0.0.1:${server.address().port}/`,
    close: () => new Promise(c => { server.closeAllConnections?.(); server.close(c); }),
  })));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  serve(FIXTURES, Number(process.env.PORT) || 4321).then(s => console.log(`Fixtures at ${s.url}`));
}
