# NAS deploy (Macről)

A **`deploy-nas.sh`** a repó gyökerében a Macről feltölti a fájlokat a NAS-ra és restartolja a konténert.

**Megjegyzés:** A script csak azon a gépen futtatható, ahol a NAS-ra van SSH hozzáférés (kulcs a NAS `authorized_keys`-ében). Ha másokkal megosztod a repót, ők nem tudnak ezzel deployolni, csak lokálisan futtatni a projektet (a deploy a te környezetedre van kihegyezve).

**Futtatás** (a projekt mappájából):

```bash
cd /Users/sitkeitamas/Documents/GitHub/kreditbefogadas
./deploy-nas.sh
```

**Előfeltétel:** SSH kulccsal be tudsz lépni a NAS-ra (`ssh sitkeitamas@dsm.sitkeitamas.hu`), és a NAS-on a projekt itt van: `/volume1/docker/kreditbefogadas` (a konténer neve: `kreditbefogadas-kredit-app-1`).

**Opcionális** környezeti változók (ha más a host/user/path):

```bash
NAS_HOST=dsm.sitkeitamas.hu NAS_USER=sitkeitamas NAS_PATH=/volume1/docker/kreditbefogadas ./deploy-nas.sh
```

**Elérés internetről:** **https://kredit.sitkeitamas.hu** – a szolgáltatás reverse proxyval van kitéve HTTPS-re, port nélkül. A belső 5111-es port csak a proxy számára releváns.
