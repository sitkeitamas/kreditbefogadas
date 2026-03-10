# NAS deploy (csak új tagre)

A NAS-ra **nem minden push** után deployolunk, csak ha **új verzió taget** pusholsz (pl. `v2.0`, `v3.0`).

## Működés

- **Trigger:** amikor a GitHubra pusholsz egy **taget**, ami **`v*`** mintára illeszkedik (pl. `v2.0`, `v1.0`).
- **Workflow:** `.github/workflows/deploy-nas.yml`
  1. Checkout a repóból.
  2. SSH kulccsal csatlakozik a NAS-odhoz.
  3. Feltölti a **`server-working.js`** és a **`data/kredit_data.json`** (és opcionálisan a **`data/2025_creditAccList.xlsx`**) fájlokat a NAS **`data`** mappájába (és a szervert a megadott könyvtárba).
  4. SSH-n keresztül lefuttatja a **`docker restart kreditbefogadas-kredit-app-1`** parancsot a NAS-on.

## Beállítás (egyszer)

A GitHub **Secrets** (Repository → Settings → Secrets and variables → Actions) alá kell megadni:

| Secret neve | Példa | Kötelező |
|-------------|--------|----------|
| `NAS_HOST` | `dsm.sitkeitamas.hu` vagy a NAS IP címe | igen |
| `NAS_USER` | SSH felhasználó (pl. `sitkeitamas`) | igen |
| `NAS_SSH_PRIVATE_KEY` | A teljes SSH **privát** kulcs tartalma (amivel a NAS-ra be tudsz lépni) | igen |
| `NAS_DEPLOY_PATH` | A projekt mappája a NAS-on (pl. `/volume1/docker/kreditbefogadas`); ha üres, ez az útvonal lesz az alapértelmezett | nem |

- **SSH kulcs:** a gépeden pl. `cat ~/.ssh/id_rsa` (vagy ami a NAS-hoz van használva); a teljes kimenetet másold be a `NAS_SSH_PRIVATE_KEY` secret értékébe. A NAS-on a megfelelő **publikus** kulcs legyen az `authorized_keys`-ben.

## Deploy futtatása

1. Lokálisan mindent commitolsz, amit ki akarsz vinni (pl. friss `data/kredit_data.json`, `server-working.js`).
2. Új taget csinálsz és pusholod:
   ```bash
   git tag -a v2.1 -m "v2.1 description"
   git push origin v2.1
   ```
3. A GitHub Actions automatikusan lefuttatja a **Deploy to NAS on tag** workflowot; a NAS-on frissülnek a fájlok és újraindul a konténer.

Ha **nem** pusholsz új taget, a workflow **nem** fut – így a deploy csak akkor történik, amikor te úgy döntesz (új verzió taggel).
