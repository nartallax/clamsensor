import {testWithSetupA} from "tester_a";

testWithSetupA("Another excluded tests!", () => { throw new Error("Absolutely not!") })