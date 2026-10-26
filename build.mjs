/** Build both editions with Node.js built-ins. No install step or dependencies. */
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
await mkdir(path.join(dist, 'assets'), { recursive: true });
const names = ['index.html', 'styles.css', 'core.js', 'space.js', 'app.js'];
for (const name of names) await copyFile(path.join(root, 'src', name), path.join(dist, name));
for (const weight of ['regular', 'bold']) await access(path.join(dist, 'assets', `arabic-${weight}.woff`));
let html = await readFile(path.join(root, 'src/index.html'), 'utf8');
let css = await readFile(path.join(root, 'src/styles.css'), 'utf8');
for (const weight of ['regular', 'bold']) {
  const bytes = await readFile(path.join(dist, 'assets', `arabic-${weight}.woff`));
  css = css.replace(`assets/arabic-${weight}.woff`, `data:font/woff;base64,${bytes.toString('base64')}`);
}
// A function replacement keeps literal $, $$, $&, etc. in embedded source.
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`);
const scripts = [];
for (const name of ['core.js', 'space.js', 'app.js']) {
  html = html.replace(`<script src="${name}" defer></script>`, '');
  scripts.push(await readFile(path.join(root, 'src', name), 'utf8'));
}
html = html.replace('</body>', () => `<script>\n${scripts.join('\n')}\n</script>\n</body>`);
await writeFile(path.join(root, 'index.html'), html, 'utf8');
console.log(`Madar Cosmos: built dist/ and portable index.html (${Math.round(Buffer.byteLength(html) / 1024)} KiB).`);
