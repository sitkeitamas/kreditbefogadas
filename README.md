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
