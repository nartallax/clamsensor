#!/bin/bash
set -e
cd `dirname "$0"`
cd ..

# let's test the testing framework!

rm -rf target
scripts/eslint.sh
scripts/generate_dts.sh "clamsensor_test.d.ts"
./node_modules/.bin/imploder --tsconfig tsconfig.json --profile test
node -e 'require("./target/clamsensor_test").main()' target/clamsensor_test.js "$@"