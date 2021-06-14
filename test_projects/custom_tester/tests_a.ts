import {birdCount, testWithSetupA} from "tester_a";

testWithSetupA("bird", assert => {
	assert(birdCount).equalsTo(1);
});

testWithSetupA("bird two", assert => {
	assert(birdCount).equalsTo(1);
});