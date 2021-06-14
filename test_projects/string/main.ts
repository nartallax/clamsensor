import {test} from "../../target/clamsensor_test";

test("good strings", assert => {
	assert("abcde").equalsTo("abcde");
	assert("abcde").notEqualsTo("edcba");
	assert("abcde").notEqualsTo(5);
	assert("5").notEqualsTo(5);
	assert("abcde").notEqualsTo({});
	assert("abcde").notEqualsTo({toString: () => "abcde"});
	assert("abcde").startsWith("abc");
	assert("abcde").notStartsWith("bcd");
	assert("abcde").endsWith("cde");
	assert("abcde").notEndsWith("bcd");
	assert("abcde").contains("")
	assert("abcde").contains("bcd")
	assert("abcde").contains("abcde")
	assert("abcde").notContains("dcb")
	assert("abcde").notContains("zzz")
	assert("abcde").isTruthy();
	assert("abcde").isNotTrue();
	assert("").isFalsy();
	assert("abcde").matches(/^[a-e]+$/)
	assert("abcde").notMatches(/^\d+$/)
});

test("fail_equals", assert => assert("abcde").equalsTo("bcd"));
test("fail_not_equals", assert => assert("abcde").notEqualsTo("abcde"));
test("fail_starts_with", assert => assert("abcde").startsWith("bcd"));
test("fail_not_starts_with", assert => assert("abcde").notStartsWith("abc"));
test("fail_ends_with", assert => assert("abcde").endsWith("bcd"));
test("fail_not_ends_with", assert => assert("abcde").notEndsWith("cde"));
test("fail_contains", assert => assert("abcde").contains("ecd"));
test("fail_not_contains", assert => assert("abcde").notContains("bcd"));
test("fail_truthy", assert => assert("").isTruthy());
test("fail_falsy", assert => assert("abcde").isFalsy());
test("fail_matches", assert => assert("abcde").matches(/^[a-e]{,3}$/));
test("fail_not_matches", assert => assert("abcde").notMatches(/^[a-e]{5}$/));