#!/bin/bash

# Express API (src/server.ts) başlat
npx ts-node src/server.ts &

# CoreNode API (src/coreNode/server.ts) başlat
npx ts-node src/coreNode/server.ts &

# container’ın canlı kalması için
wait -n