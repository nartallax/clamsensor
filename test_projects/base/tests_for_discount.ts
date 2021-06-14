import {costWithDiscount} from "lib";
import {test} from "../../target/clamsensor_test";

test("basic cost calculation", assert => {
	assert(costWithDiscount(10, 1)).equalsTo(10);
	assert(costWithDiscount(10, 5)).equalsTo(50);
	assert(costWithDiscount(10, 10)).equalsTo(95);
});


test("sequental cost calculation", assert => {
	for(let i = 1; i <= 25; i++){
		assert(costWithDiscount(i, i)).biggerThan(costWithDiscount(i, i - 1));
		assert(costWithDiscount(i, i)).biggerThan(costWithDiscount(i - 1, i));
		assert(costWithDiscount(i, i)).biggerThan(costWithDiscount(i - 1, i - 1));
	}
});

test("cost calculation corner cases", assert => {
	assert(costWithDiscount(0, 0)).equalsTo(0);
	assert(costWithDiscount(5, 0)).equalsTo(0);
	assert(costWithDiscount(0, 5)).equalsTo(0);
});

test("cost calculation bad values", assert => {
	assert(() => costWithDiscount(-1, 0)).throws("Bad item cost/item count: -1, 0");
	assert(() => costWithDiscount(0, -1)).throws("Bad item cost/item count: 0, -1");
	assert(() => costWithDiscount(-1, -1)).throws("Bad item cost/item count: -1, -1");
	assert(() => costWithDiscount(-1, 100)).throws("Bad item cost/item count: -1, 100");
});