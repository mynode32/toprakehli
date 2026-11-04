import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { fileURLToPath } from 'node:url';
import { createLocalServer } from '../scripts/local-server.mjs';

test('local HTTP routing, headers and file access boundaries', async t => {
  const server = createLocalServer(fileURLToPath(new URL('../', import.meta.url)));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const port = server.address().port;
  function send(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = request({ hostname: '127.0.0.1', port, path, method }, res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      req.end();
    });
  }
  await t.test('HTML and module assets have correct MIME and nosniff', async () => {
    for (const [path, type] of [['/', 'text/html'], ['/src/main.js', 'text/javascript'], ['/src/styles.css', 'text/css'], ['/src/assets/demo-1.webp', 'image/webp'], ['/src/assets/whatsapp.svg', 'image/svg+xml'], ['/src/assets/toprak-ehli-logo.jpg', 'image/jpeg']]) {
      const result = await send(path);
      assert.equal(result.status, 200);
      assert.ok(result.headers['content-type'].startsWith(type));
      assert.equal(result.headers['x-content-type-options'], 'nosniff');
      assert.ok(result.body.length > 0);
    }
  });
  await t.test('private files, raw encoded traversal and malformed URLs are rejected', async () => {
    for (const path of ['/admin/', '/.private/admin-auth.json', '/package.json', '/docs/ROADMAP.md', '/reference/toprak_ehli_demo.html', '/src/missing.js', '/src/../../README.md', '/src/%2e%2e%2f%2e%2e%2fREADME.md', '/src/%2e%2e%5c%2e%2e%5cREADME.md', '/src/%ZZ']) {
      const result = await send(path);
      assert.equal(result.status, 404, path);
      assert.equal(result.body, 'Not found');
    }
  });
  await t.test('HEAD omits body; write methods are rejected', async () => {
    const head = await send('/', 'HEAD');
    assert.equal(head.status, 200);
    assert.equal(head.body, '');
    for (const method of ['POST', 'PUT', 'DELETE']) {
      const result = await send('/', method);
      assert.equal(result.status, 405);
      assert.equal(result.headers.allow, 'GET, HEAD');
    }
  });
});
