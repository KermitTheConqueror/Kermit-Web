# PokéRogue — Kermit self-hosted build

Built October 29, 2026 from upstream source with the project's supported `app` mode.
No gameplay source changes. This does not embed pokerogue.net.

Source and exact revisions:
- Game: https://github.com/pagefaultgames/pokerogue/tree/7fd2ba7058e5f6a62eca96987f16072cece383da
- Assets: https://github.com/pagefaultgames/pokerogue-assets/tree/8250b23677d4918801fc6fc1e95b6dd1c30ef6c4
- Translations: https://github.com/pagefaultgames/pokerogue-locales/tree/b24c6f3d1b3f4449440d0200487e614e69b5df3d

Credits belong to Pagefault Games and the contributors listed in CREDITS.md.
See LICENSE, LICENSES/, and each source repository's REUSE.toml for licensing and asset attribution. Keep these notices when distributing this build. No affiliation or endorsement is implied.

## Build again

Use Node 24.9+ and pnpm 10.34.5. Clone the source repository, check out the exact game commit above, then initialize the assets and locales submodules at their pinned commits.
Run `pnpm install --frozen-lockfile --ignore-scripts`, then `node node_modules/vite/bin/vite.js build --mode app`.
The complete dist/ output goes in Kermit's pokerogue/ directory. Preserve the notices and exact source links alongside the build.

## Saves and hosting

App mode uses the upstream local-save option. Saves belong to this browser and origin, not your official PokéRogue account. Export save data from the in-game menu before clearing browser storage or moving to another domain.
Cloud accounts and online services are not hosted here. The offline build may still attempt optional localhost services that are not running; core local play does not require them.
Upload the entire pokerogue/ directory, not only index.html. There are tens of thousands of asset files and approximately 800 MB of data. Check your host's deployment size/file-count limits before publishing. This build is not included in the October 28 update ZIP.
