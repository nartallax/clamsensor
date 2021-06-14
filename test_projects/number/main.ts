import {test} from "../../target/clamsensor_test";

test("good numbers", assert => {
	assert(12345).equalsTo(12345);
	assert(0x10).equalsTo(16);
	assert(12345).notEqualsTo(54321);
	assert(12345).biggerOrEqualsTo(12345);
	assert(12345).biggerOrEqualsTo(12344.9);
	assert(12345).biggerThan(12344.9);
	assert(12345).biggerThan(-12344.9);
	assert(12345).smallerOrEqualsTo(12345);
	assert(12345).smallerOrEqualsTo(12345.1);
	assert(12345).smallerThan(12345.1);
	assert(-12345).smallerThan(12344.9);
	assert(0).isFalsy();
	assert(1).isTruthy();
	assert(0.1).isTruthy();
	assert(0).isNotTrue();
	assert(1).isNotTrue();
});

test("fail_equals_to", assert => assert(12345).equalsTo(54321));
test("fail_not_equals_to", assert => assert(12345).notEqualsTo(12345));
test("fail_bigger_or_equals", assert => assert(12345).biggerOrEqualsTo(12346));
test("fail_smaller_or_equals", assert => assert(12345).smallerOrEqualsTo(12344));
test("fail_bigger", assert => assert(12345).biggerThan(12345));
test("fail_smaller", assert => assert(12345).smallerThan(12345));
test("fail_truthy", assert => assert(0).isTruthy());
test("fail_falsy", assert => assert(1).isFalsy());
test("fail_true_0", assert => assert(0).isTrue());
test("fail_true_1", assert => assert(1).isTrue());