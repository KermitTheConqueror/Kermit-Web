(() => {
  const ROOT = '/home/web_user/love';
  const MAX = 64 * 1024 * 1024;
  let restoring = false;
  function runtime() { return window.KermitBalatroRuntime || window.Module; }
  function fs() {
    const value = runtime()?.KermitFS;
    if (!value) throw Error('Balatro’s save storage is not ready yet.');
    // Test the actual save mount rather than an engine startup flag.
    const node = value.lookupPath(ROOT).node;
    if (!node?.mount || node.mount.mountpoint !== ROOT) throw Error('Balatro’s save storage is not ready yet.');
    return value;
  }
  function sync(FS) {
    return new Promise((resolve, reject) => FS.syncfs(false, error => error ? reject(error) : resolve()));
  }
  function list(FS, path = ROOT, files = []) {
    for (const name of FS.readdir(path)) {
      if (name === '.' || name === '..') continue;
      const full = path + '/' + name, stat = FS.lstat(full);
      if (FS.isDir(stat.mode)) list(FS, full, files);
      else if (FS.isFile(stat.mode)) files.push(full);
    }
    return files;
  }
  function encode(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
    return btoa(binary);
  }
  function validate(bytes) {
    if (bytes.byteLength > MAX) throw Error('Balatro backup is too large.');
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (data.format !== 'kermit-balatro-files' || data.version !== 1 || !Array.isArray(data.files) || !data.files.length || data.files.length > 10000) throw Error('Invalid Balatro backup.');
    let size = 0;
    const seen = new Set();
    return data.files.map(file => {
      if (typeof file.path !== 'string' || !file.path || file.path.length > 512 || file.path.split('/').some(part => !part || part === '.' || part === '..') || /[\\\x00-\x1f:]/.test(file.path) || seen.has(file.path) || typeof file.data !== 'string') throw Error('Invalid save-file path.');
      seen.add(file.path);
      const raw = atob(file.data);
      size += raw.length;
      if (size > MAX) throw Error('Balatro backup is too large.');
      return {path:ROOT + '/' + file.path, bytes:Uint8Array.from(raw, c => c.charCodeAt(0))};
    });
  }
  window.KermitBalatroSaves = {
    ready() {try {return !!fs();} catch {return false;}},
    async getState() {
      const FS = fs();
      if (restoring) throw Error('Restore in progress.');
      const paths = list(FS);
      if (!paths.length) throw Error('No Balatro save files yet. Start a run and return to the menu first.');
      const files = paths.map(path => ({path:path.slice(ROOT.length + 1), data:encode(FS.readFile(path))}));
      const bytes = new TextEncoder().encode(JSON.stringify({format:'kermit-balatro-files',version:1,files}));
      if (bytes.length > MAX) throw Error('Balatro backup is too large.');
      await sync(FS);
      return bytes;
    },
    async loadState(bytes) {
      const entries = validate(bytes), FS = fs();
      if (restoring) throw Error('Restore in progress.');
      restoring = true;
      const previous = list(FS).map(path => ({path,bytes:FS.readFile(path).slice()}));
      runtime().pauseMainLoop();
      function replace(files) {
        for (const path of list(FS)) FS.unlink(path);
        for (const file of files) {
          FS.mkdirTree(file.path.slice(0,file.path.lastIndexOf('/')));
          FS.writeFile(file.path,file.bytes);
        }
      }
      try {
        replace(entries);
        await sync(FS);
        location.reload();
      } catch (error) {
        replace(previous);
        try {await sync(FS);} catch {}
        restoring = false;
        runtime().resumeMainLoop();
        throw error;
      }
    }
  };
})();
