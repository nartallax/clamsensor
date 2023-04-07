# Clam Sensor

A builder-agnostic tool to test Typescript projects.  
For those of us who deem Jest needlessly complicated and demanding.  

## How it works

First, you define tests. Tests are defined in files that ends in `.test.ts`, as per custom.  
Second, you generate test code. Test code contains imports from all `.test.ts` files to avoid tree-shaking, and code that runs all (or some of) the defined tests.  
Third, you build and launch test build. It runs tests you select and gives progress and results in stderr. It also exits with nonzero exit code if testing was not successful.  

## Usage

### Install  

    npm install --save-dev @nartallax/clamsensor

### Define the tests

First step is to define the test cases.

    import {test} from "@nartallax/clamsensor";
    import {MyCalc} from "appcode/my_calc";

    define("addition", () => {
        test("calculator should sum numbers correctly", () => {
            if(MyCalc.sum(1,2,3) !== 6){
                throw new Error("Something is wrong")
            }
        })
    })

It's up to you what assertion library to use. Clamsensor don't have anything built-in for that; the only expectation is that test will throw if something is not right.  
Asyncronous tests should return promise.  

### Generating the code

To generate the code, you should run `./node_modules/.bin/clamsensor_generator.js ./src/test ./generated/test_entrypoint.ts`.  
If you want to just have a module that imports from all the test modules without running them, you can add `--no-run` as generator option.  

### Running the code

Next step is to build your test build using file generated at the previous step as entrypoint. It's up to you how to do that.  
Then you can run your build like `node ./dist/test_build.js`.  
If you chose to add code that runs test in generated code (default behaviour), you should also be able to pass an argument to filter by test name.  

## Naming

Clams are sometimes used as a sensors to control quality of outputted water in some water treatment plants.  
