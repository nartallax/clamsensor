import {test} from "../../target/clamsensor_test";

test("failing test", assert => {
	assert(5 as 5 | 6).equalsTo(6);
})