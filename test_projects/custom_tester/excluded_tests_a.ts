import {test} from "../../target/clamsensor_test";

test("I am excluded!", () => { throw new Error("NOPE") });