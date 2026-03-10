# Kreditbefogadás – használati leírás

## Adatbázis

Nincs külön adatbázis motor. Az egész **„db” egy óriási JSON fájl**: **`data/kredit_data.json`**. Ez egy JSON tömb; minden rekordban: intézmény, ország, teljesített tantárgy, Corvinusos tantárgy neve/kódja, tanév, **megjegyzés** (comment), stb. – ahogy az utolsó fejlesztésben rögzítettük.

A **`data/` könyvtár** az egyetlen hely: ide kerül az **XLS** forrás, és itt van a generált **`kredit_data.json`** (megjegyzésekkel kiegészített struktúrával). Amikor a kód fordul, a Docker elkészül – a `data/` mindig itt a helye az adatnak.

---

## 1. Docker build és futtatás

Amikor fordul a kód és elkészül a Docker:

- A **`data/`** könyvtár a helye minden adatnak: az **XLS**, amiből beolvassuk az adatokat, és a **`kredit_data.json`**, amit felépítünk / frissítünk (megjegyzésekkel).
- Először a **`data/`**-ba tedd az Excel fájlt, futtasd a **`node upload_data.js`**-t (lásd alább), majd indítsd a konténert.

**Példa (lokális Docker):**

```bash
cd /Users/sitkeitamas/Documents/GitHub/kreditbefogadas

# 1) Adat: XLS a data/ mappába, majd JSON generálás
node upload_data.js

# 2) Szerver lokálisan (opcionális teszt)
PORT=5050 KREDIT_DATA_PATH="$(pwd)/data/kredit_data.json" node server-working.js
# Böngésző: http://localhost:5050

# 3) Docker build és futtatás (a data/ volume-ból olvassa a kredit_data.json-t)
docker compose up -d
# A compose a ./data mappát mountolja → /app/data → itt várja a kredit_data.json-t
```

**NAS-on** (Synology): ugyanígy a **`data/`** a helye az XLS-nek és a **`kredit_data.json`**-nak; a compose ezt a mappát mountolja. Build/futtatás után a konténer a **`/app/data/kredit_data.json`**-t használja.

---

## 2. Adatok frissítése Excelből

- **Forrás**: az aktuális Excel fájlt tedd a **`data/`** mappába (pl. `data/2025_creditAccList.xlsx`).
- **Konverzió** (a projekt gyökeréből):

```bash
cd /Users/sitkeitamas/Documents/GitHub/kreditbefogadas
node upload_data.js
```

- **Teljes újraépítés (reinit):** `node upload_data.js --reinit` – a db csak az Excelből épül, a régi JSON felülírásra kerül. Reinit vagy bármilyen JSON-frissítés után **mindig indítsd újra a szervert**, különben a felület a régi (memóriában lévő) adatot mutatja (pl. régi rekordszám, hiányzó megjegyzések).
- **Bővítés (alapértelmezett):** `node upload_data.js` – a szkript a **`data/`**-ból olvassa az XLS-t, a meglévő **`data/kredit_data.json`**-t **bővíti** (megjegyzés mezővel együtt), az eredményt **`data/kredit_data.json`**-ba írja.
- Ha csak egy `.xlsx` van a `data/`-ban, azt használja; különben: `INPUT_XLS=2025_creditAccList.xlsx node upload_data.js`.

---

## 3. Lokális futtatás és tesztelés

```bash
cd /Users/sitkeitamas/Documents/GitHub/kreditbefogadas
PORT=5050 KREDIT_DATA_PATH="$(pwd)/data/kredit_data.json" node server-working.js
```

- Böngésző: **`http://localhost:5050`**
- Szűrők: Ország, Intézmény, Teljesített tantárgy, Tanév. A **Megjegyzés** oszlop a cellában mutatja a szöveget (ahogy legutóbb készült).

---

## 4. NAS / Docker frissítés

1. **Fájlok a NAS-on**: a **`data/`** mappába kerüljön az XLS és a **`data/kredit_data.json`** (megjegyzésekkel). A **`server-working.js`** a projekttel együtt (ahol a compose van).
2. Feltöltés után a NAS-on:

```bash
cd /volume1/docker/kreditbefogadas
docker compose -f docker-compose.simple.yml up -d
# vagy
docker restart kreditbefogadas-kredit-app-1
```

3. Böngészőben: **https://kredit.sitkeitamas.hu** (reverse proxyval HTTPS-re, port nélkül). A konténer a **`/app/data/kredit_data.json`**-t olvassa (a host **`data/`** mappája).

---

## 5. Tipikus hibák

- **Port 5050 foglalt**: `lsof -nP -iTCP:5050 -sTCP:LISTEN` → `kill <PID>`
- **Nincs adat**: a szerver demo adatra vált. Ellenőrizd: **`data/kredit_data.json`** létezik és a szervernek ez az útvonal van megadva.
- **Excel nem található**: az **`.xlsx`** fájlt a **`data/`** mappába tedd, majd futtasd újra a **`node upload_data.js`**-t.

---

## 6. Összefoglaló workflow

1. **`data/`** = az XLS forrás és a **`kredit_data.json`** (megjegyzésekkel kiegészítve) helye – build és Docker futtatásakor is.
2. Új Excel → bemásolás a **`data/`**-ba → **`node upload_data.js`** → frissül a **`data/kredit_data.json`**.
3. Lokális teszt: **`PORT=5050 KREDIT_DATA_PATH="$(pwd)/data/kredit_data.json" node server-working.js`**, böngésző: `http://localhost:5050`.
4. NAS: **`server-working.js`** + **`data/`** (XLS + **`kredit_data.json`**) feltöltése → **`docker restart ...`** → ellenőrzés: **https://kredit.sitkeitamas.hu**

---

## 7. Verziószám (x.y.z)

A verzió a **`VERSION`** fájlban van (egy sor, pl. `2.0.1`), és a weboldal tetején jelenik meg („Kreditbefogadás v2.0.1”).

**Növelés check-in/kiadás előtt:**
- **z** nő: minden olyan check-innél, amikor valamit beteszünk (nem csak javítás).
- **y** nő: új funkció (pl. új szűrő, export).
- **x** nő: nagy áttörés (pl. Excel feltöltés a böngészőből).
