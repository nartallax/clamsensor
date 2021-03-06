# Clam Sensor

A tool to test Typescript projects. Meant to be used with [Imploder](https://github.com/nartallax/imploder "Imploder").

## How it works

First, you define tests. It works best if tests are defined in files/modules separated from the code it tests.  
Second, you build test bundle. Test bundle contains test definition code and tested code. It also has entrypoint code generated by the tool. The tool knows where tests are because the tool defines a Typescript transformer that iterates over code and finds test definition function calls.  
Third, you launch test bundle. It runs tests you select and gives progress and results in stderr. It also exits with nonzero exit code if testing was not successful.  

## Usage

### Install  

    npm install --save-dev @nartallax/clamsensor

### Configure

Typical configuration may look like this (that's tsconfig.json):

    {
    "imploderConfig": {
        "entryModule": "ts/main.ts",
        "entryFunction": "main",
        "outFile": "target/bundle.js",
        "target": "es2018",
        "profiles": {
            "release": {
                "target": "es5"
            },
            "test": {
                "entryModule": "generated/test_entrypoint.ts",
                "entryFunction": "testMain",
                "outFile": "target/test_bundle.js",
                "plugins": [
                    {
                        "transform": "@nartallax/clamsensor",
                        "type": "imploder",
                        "generatedFilePath": "generated/test_entrypoint.ts",
                        "useTestsInModule": [
                            "^/tests_for_.*$"
                        ],
                    }
                ]
            }
        }
    },

    "compilerOptions": { ... }
    }

As you can see the tool is configured by adding transformer to project. All the configuration parameters are passed as parameters of said transformer.  
You better do so in separate Imploder profile (as you do not need this transformer for anything but test builds), but it's up to you.  
You can select what tests will be included in bundle with useTestsInModule parameter. It accepts string or array of strings which are regular expressions. Only modules with names matching at least one regular expression will be included in test bundle.  

### Define the tests

Next step is to define the test cases.

    import {test} from "@nartallax/clamsensor";
    import {MyCalc} from "appcode/my_calc";

    test("summing", "calculator should sum numbers correctly", assert => {
        assert(MyCalc.sum(1,2,3)).equals(6);
    });

    test("subtracting", assert => {
        assert(MyCalc.subtract(5, 1, 1)).equals(3);
    });

assert parameter in examples above is function that returns helper object depending on type of value it is supplied with.  
For example, following code is valid:

        assert(() => MyCalc.divide(1, 0)).throws("Division by zero!");
        assert(() => MyCalc.fibonacci(15)).fasterThan(50);

I won't cover all the possibilities of the function here; it's up to you to explore .d.ts of the tool.  

### Define custom tester

Sometimes multiple tests require same setup and/or cleanup. To make the code more clear you should define custom testing function:  

    import {ClamsensorTestRunner, ClamsensorDefaultAssertor} from "@nartallax/clamsensor";
    import {setupTestDb, cleanupTestDb} from "my_app/db/for_tests";

    export const testWithDb = ClamsensorTestRunner.createTestDefinerFunction({
        // here you can pass something more interesting than just default assert
        getAssertor: () => ClamsensorDefaultAssertor,
        beforeTest: async descr => {
            console.error("Setting up test DB for test " + descr.name + " in " + descr.moduleName);
            await setupTestDb();
        },
        afterTest: async () => {
            await cleanupTestDb();
        }
    })

And then you could use testWithDb function to define tests just like you used test function.  

### Launching the bundle

If you want to run all the tests in the test bundle, you just run it:

    node target/test_bundle.js

You may pass parameters to select only some tests by module name and/or test name:

    node target/test_bundle.js --by-module /tests/general/my_test --by-name first_test

All possible parameters are --by-name, --by-name-prefix, --by-name-regexp, --by-module, --by-module-prefix, --by-module-regexp. If more than one parameter is passed, only tests that matches all the filters will be executed.  

## Naming

Clams are sometimes used as a sensors to control quality of outputted water in some water treatment plants.  

## TODO  

code coverage (note to self: bundle main entrypoint code when doing code coverage, otherwise files without tests at all may not receive code coverage info)  
