# Storefront skins

The live site (GitHub Pages, `main`) serves whatever four files sit at the repo root:
`app.js`, `config.js`, `index.html`, `styles.css`. Each folder here is a saved skin of those
four files. Logos and icons for every skin live side by side in `assets/`.

| Skin | Folder | Personas |
|---|---|---|
| Westpac B2C (current live root) | `skins/westpac/` | Hannah, Daniel, Anita |
| AA Insurance (NZ) | `skins/aai/` | Mia Tane, Robyn Hale, Wiremu Parata |
| NRMA | `skins/nrma/` | NRMA members |

## Swap the root to a skin

```bash
./skins/use-skin.sh aai --dry-run   # what would change
./skins/use-skin.sh aai             # copy skins/aai/* over the root files
git diff --stat                     # review
git commit -am "Storefront: switch to AA Insurance skin" && git push origin main
```

Back to Westpac: `./skins/use-skin.sh westpac`, commit, push.

## AA Insurance: set the persona Contact Ids first

The AAI personas are new 4b Contacts, so their Ids are only known after
`scripts/apex/build_aai_personas.apex` runs (it prints them). Paste them into
`skins/aai/app.js`:

```bash
sed -i '' -e 's/REPLACE_MIA_CONTACT_ID/003.../' \
          -e 's/REPLACE_ROBYN_CONTACT_ID/003.../' \
          -e 's/REPLACE_WIREMU_CONTACT_ID/003.../' skins/aai/app.js
```

`use-skin.sh` warns while placeholders remain. Open a persona with `?who=mia`, `?who=robyn`,
`?who=wiremu` (or `?who=anon`).

The AAI email logo is `assets/aai-logo.png` on GitHub Pages, so `assets/` must be on `main`
before the demo emails render their logo (merging the `assets/aai-*` files changes nothing
on the live Westpac root).
