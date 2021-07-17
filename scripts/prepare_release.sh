#!/bin/bash
set -e
cd `dirname "$0"`
cd ..

rm -rf ./target
scripts/eslint.sh
./node_modules/.bin/imploder --tsconfig tsconfig.json
scripts/generate_dts.sh "clamsensor.d.ts"
cp ./package.json ./target/
cp ./LICENSE ./target/
cp ./README.MD ./target/