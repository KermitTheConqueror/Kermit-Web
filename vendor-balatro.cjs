// Fetch the existing engine and apply narrowly scoped persistence fixes.
const fs = require('node:fs/promises');
(async () => {
  const response = await fetch('https://huggingface.co/spaces/Katsugachi/Balatro/resolve/main/love.min.js');
  if (!response.ok) throw Error(`Engine download: ${response.status}`);
  let source = await response.text();
  const expose = 'Module.FS_createFolder = FS.createFolder,';
  const sync = 'FS.syncfs(true, (e) => {';
  if (!source.includes(expose) || source.split(sync).length !== 2) throw Error('Engine changed; review patches.');
  source = source.replace(expose, 'Module.KermitFS = FS,\n' + expose)
    .replace(sync, 'FS.syncfs(false, (e) => {');
  await fs.writeFile('balatro-love.js', source);
})();
