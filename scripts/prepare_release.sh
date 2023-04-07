#!/bin/bash
set -e
cd `dirname "$0"`
cd ..

rm -rf ./target
mkdir -p ./target
scripts/eslint.sh
./node_modules/.bin/parcel build --target lib --no-cache
mv ./dist/lib/main.js ./target/clamsensor.js
./node_modules/.bin/parcel build --target generator --no-cache
mv ./dist/generator/generator.js target/clamsensor_codegen.js
scripts/generate_dts.sh "clamsensor.d.ts"
cp ./package.json ./target/
cp ./LICENSE ./target/
cp ./README.MD ./target/