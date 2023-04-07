#!/bin/bash
set -e
cd `dirname "$0"`
cd ..

rm -rf ./target
mkdir -p ./target
scripts/eslint.sh
./node_modules/.bin/parcel build --target lib --no-cache
cat ./dist/lib/main.js | sed "s/^\/\/# sourceMappingURL.*$//g" > ./target/clamsensor.js
./node_modules/.bin/parcel build --target generator --no-cache
echo "#!/usr/bin/env node" > ./target/clamsensor_codegen.js
cat ./dist/generator/generator.js | sed "s/^\/\/# sourceMappingURL.*$//g" > ./target/clamsensor_codegen.js
scripts/generate_dts.sh "clamsensor.d.ts"
cp ./package.json ./target/
cp ./LICENSE ./target/
cp ./README.MD ./target/