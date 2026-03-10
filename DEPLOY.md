# NAS deploy (Macről)

A **`deploy-nas.sh`** a repó gyökerében a Macről feltölti a fájlokat a NAS-ra és restartolja a konténert.

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
