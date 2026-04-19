#!/bin/bash
# Apply fixes for puppeteer to both script files.
sed -i 's/headless: '"'"'new'"'"'/headless: true/g' scripts/import-cifraclub.ts
sed -i 's/headless: '"'"'new'"'"'/headless: true/g' backend/scripts/import-cifraclub.ts

# Add ignore for the missing puppeteer dependency and the namespace issue
sed -i '1s/^/\/\/ @ts-ignore\n/' scripts/import-cifraclub.ts
sed -i 's/let browser;/let browser: any;/g' scripts/import-cifraclub.ts

sed -i '1s/^/\/\/ @ts-ignore\n/' backend/scripts/import-cifraclub.ts
sed -i 's/puppeteer.Browser/any/g' backend/scripts/import-cifraclub.ts
