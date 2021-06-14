import {testWithSetupB} from "tester_b";

testWithSetupB("good cat", assert => {
	assert("good cat" === 'good cat');
});

testWithSetupB("bad cat", assert => {
	assert("bad cat");
});