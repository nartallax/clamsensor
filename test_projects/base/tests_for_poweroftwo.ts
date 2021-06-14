import {countPowerOfTwo} from "lib";
import {test} from "../../target/clamsensor_test";

test("good values", "values that not expected to throw", assert => {
	assert(countPowerOfTwo(8)).equalsTo(3);
	assert(countPowerOfTwo(1)).equalsTo(0);
	assert(countPowerOfTwo(1024)).equalsTo(10);
})

test("bad values", "values that are expected to throw", assert => {
	assert(() => countPowerOfTwo(7)).throws("Is NOT power of two: 7")
	assert(() => countPowerOfTwo(1.5)).throws("Is NOT power of two: 1.5")
	assert(() => countPowerOfTwo(-4)).throws("Bad input number: -4")
});