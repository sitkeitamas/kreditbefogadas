# Kreditbefogadás Adatfeldolgozó

Egy webes felület Excel táblázatok feldolgozására és megjelenítésére, kifejezetten kreditbefogadási adatokhoz.

## Funkciók

- **Excel fájl feltöltése**: .xlsx és .xls formátumú fájlok kezelése
- **Adatszűrés**: Ország, intézmény, teljesített tantárgy és tanév szerint
- **Historizálás**: Minden feltöltés nyomon követése UUID-val
- **Responsive design**: Mobilbarát felület
- **Docker támogatás**: Könnyű telepítés és futtatás
- **Publikus hozzáférés**: Nincs szükség bejelentkezésre

## Telepítés és futtatás

### Docker segítségével (ajánlott)

1. **Clone a repository**:
   ```bash
   git clone <repository-url>
   cd kreditbefogadas
   ```

2. **Docker build és futtatás**:
   ```bash
   docker-compose up --build
   ```

3. **Elérés**: A böngészőben nyisd meg: `http://localhost:5000`

### Manuális telepítés

1. **Dependencies telepítése**:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Adatbázis inicializálása** (automatikus induláskor)

3. **Fejlesztési módban**:
   ```bash
   npm run dev
   ```

4. **Produkciós módban**:
   ```bash
   npm run build
   npm start
   ```

## Excel fájl formátuma

A feltöltendő Excel fájlnak a következő oszlopokat kell tartalmaznia:

- `intézmény` - Az intézmény neve
- `ország` - Az ország neve
- `teljesített tantárgy` - A külföldön teljesített tantárgy neve
- `Corvinusos (elfogadtatni kívánt) tantárgy neve` - A Corvinus-nak megfelelő tantárgy neve
- `Corvinusos (elfogadtatni kívánt) tantárgy kódja` - A Corvinus tantárgykódja
- `tanév` - A tanév (pl: 2023/24)

## API Endpoints

- `GET /api/filters` - Szűrőlehetőségek lekérése
- `GET /api/records` - Szűrt adatok lekérése (támogatja a lapozást)
- `POST /api/upload` - Excel fájl feltöltése
- `GET /api/uploads` - Feltöltési előzmények
- `DELETE /api/uploads/:uploadId` - Feltöltés törlése

## Technológiák

- **Frontend**: React 18 + TypeScript + React Select
- **Backend**: Node.js + Express
- **Adatbázis**: SQLite
- **Styling**: CSS Grid + Flexbox
- **Docker**: Multi-stage build

## Adatbázis séma

### kredit_records tábla
- `id` - Primary key
- `institution` - Intézmény neve
- `country` - Ország
- `completed_subject` - Teljesített tantárgy
- `corvinus_subject_name` - Corvinus tantárgy neve
- `corvinus_subject_code` - Corvinus tantárgykód
- `academic_year` - Tanév
- `upload_id` - Feltöltés azonosítója
- `created_at` - Létrehozás dátuma

### uploads tábla
- `id` - UUID (Primary key)
- `filename` - Eredeti fájlnév
- `upload_date` - Feltöltés dátuma
- `record_count` - Rekordok száma

## Bővítési lehetőségek

- Több év adatainak egyszerű feltöltése
- Export funkciók (CSV, PDF)
- Részletesebb statisztikák
- Adatvalidáció erősítése
- Felhasználói fiókok (opcionális)

## Licenc

MIT License

---

## Synology NAS Deployment - Tapasztalatok és Nehézségek

### 🎯 Projekt Célja
Kreditbefogadás webes alkalmazás deployolása Synology NAS-on Docker segítségével, amely:
- Excel fájlokat dolgoz fel (525 rekord)
- Szűrési funkcionalitást biztosít
- Webes felületet kínál

### 🐛 Felmerült Problémák

#### 1. Docker Permission Hell
- **Probléma:** `docker: permission denied while trying to connect to the Docker daemon socket`
- **Ok:** A felhasználó nincs a `docker` csoportban
- **Megoldási kísérletek:**
  - `sudo docker` - jelszót kér, de SSH-n keresztül nem működik
  - `docker` csoportba felvétel - admin jogok szükségesek
  - `-S` opció - nem működött

#### 2. NPM Dependency Hell
- **Probléma:** `npm install` sikertelen a containerben
- **Hibaüzenet:** Cache problémák, permission hibák
- **Megpróbált megoldások:**
  - `npm cache clean --force`
  - `rm -rf node_modules package-lock.json`
  - `npm install --no-cache`
  - Alpine vs Debian image váltás

#### 3. Shell Escaping és Heredoc Problémák
- **Probléma:** Komplex JavaScript kód beillesztése SSH-n keresztül
- **Hiba:** `parse error near '<'`
- **Ok:** Idézőjelek és speciális karakterek kezelése
- **Megoldás:** Egyszerűsített kód, kevesebb speciális karakter

#### 4. Frontend-Backend Kommunikáció
- **Probléma:** JavaScript `fetch` nem működik a böngészőben
- **Jelenség:** API válaszol, de a frontend nem kapja meg az adatokat
- **Lehetséges okok:** CORS problémák, network hibák, JavaScript hibák

### 🔄 Problémamegoldási Stratégiák

#### 1. Egyszerűsítés
- **React → Pure HTML/JS:** Komplex frontend helyett egyszerű
- **SQLite → JSON:** Adatbázis helyett egyszerű file
- **Express → Node.js HTTP:** Dependency helyett beépített modul

#### 2. Docker Alternatívák
- **Multi-stage build:** Csak a szükséges fájlokkal
- **Alpine image:** Kisebb méret, kevesebb dependency
- **Volume mounting:** Adatfájlok kívülről

#### 3. Deployment Módszerek
- **Direct SSH:** Fájlok feltöltése és futtatása
- **Git clone:** Repositoryból pullolás
- **Docker Compose:** Konfigurációból indítás

### 💡 Legjobb Gyakorlatok

#### 1. Környezet Felkészítése
```bash
# Docker csoportba felvétel
sudo usermod -aG docker sitkeitamas

# Újraindítás után
newgrp docker
```

#### 2. Egyszerű Architektúra
- **Egy file:** Minden egyben (server + HTML + JS)
- **Kevesebb dependency:** Csak Node.js beépített modulok
- **Static content:** Beágyazott HTML

#### 3. Debugging
```bash
# Container logok ellenőrzése
docker logs kredit-app

# Port ellenőrzése
curl -s http://localhost:5111/api/records

# Network tesztelése
telnet localhost 5111
```

### 🚀 Ajánlott Megoldás

#### 1. Permission Javítás
```bash
# Docker csoport beállítása
sudo synogroup --add docker sitkeitamas
sudo chown root:docker /var/run/docker.sock
sudo chmod 660 /var/run/docker.sock
```

#### 2. Egyszerű Server
```javascript
// Egy file, minden benne
const http = require('http');
const fs = require('fs');
const records = JSON.parse(fs.readFileSync('data.json'));
// HTML + JS beágyazva
```

#### 3. Docker Compose
```yaml
version: '3.8'
services:
  kredit-app:
    image: node:18-alpine
    ports:
      - "5111:5000"
    volumes:
      - ./server.js:/app/server.js
      - ./data.json:/app/data.json
    command: node /app/server.js
```

### 📊 Tapasztalatok Összefoglalása

#### ✅ Ami Működik
- SSH kapcsolat
- Fájl feltöltés
- Docker image letöltés
- Egyszerű Node.js server
- API végpontok

#### ❌ Ami Nem Működik
- Docker permission nélkül sudo
- npm install complex environmentben
- Komplex shell scriptek
- React frontend

#### 🎯 Kulcs Tanulságok
1. **Egyszerűbb = jobb** - Kevesebb dependency, kevesebb hiba
2. **Permission matters** - Docker jogosultságok kulcsfontosságúak
3. **Debug early** - Logok ellenőrzése, tesztelés
4. **Static first** - Dinamikus helyett statikus megoldás

### 🔧 Javasolt Továbblépések

1. **Permission javítás** - Docker csoport beállítása
2. **Egyszerű server** - Működő alapverzió
3. **Tesztelés** - Részletes ellenőrzés
4. **Bővítés** - Funkciók hozzáadása

**A legfontosabb: kezdjük egyszerűen, majd bonyolítsuk!**
