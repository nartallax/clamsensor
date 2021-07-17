import {test} from "../../target/clamsensor_test";

type MapPairs = [number | string | symbol, unknown][];

class Point {
	constructor(private x: number, private y: number){
		void (this.x + this.y);
	}
}

class Coords {
	constructor(private x: number, private y: number){
		void (this.x + this.y);
	}
}


test("good objects", assert => {
	assert({}).equalsTo({});
	assert({a: 5, b: 10}).equalsTo({a: 5, b: 10});
	assert({a: 5, b: 10, c: {d: 15, e: { j: 20 }}}).equalsTo({a: 5, b: 10, c: {d: 15, e: { j: 20 }}});
	assert({a: 5, b: 10, c: {d: 15, e: { j: 20 }}}).notEqualsTo({a: 5, b: 10, c: {d: 15, e: { j: 21 }}});
	assert({a: 5}).notEqualsTo({b: 10});

	assert(Symbol("x")).notEqualsTo(Symbol("x"));
	assert(Symbol.for("x")).equalsTo(Symbol.for("x"));

	let obj = {x: Symbol.for("x")};
	assert(obj).equalsTo(obj);
	assert(obj).notEqualsTo({x: Symbol("x")});
	assert(obj).equalsTo({x: Symbol.for("x")});

	assert({x: 3, y: 8}).equalsTo({x: 3, y: 8});
	assert(new Point(3, 8)).equalsTo(new Point(3, 8));
	assert(new Point(3, 8)).notEqualsTo(new Point(3, 7));
	assert(new Point(3, 8)).notEqualsTo({x: 3, y: 8});
	assert(new Point(3, 8)).notEqualsTo(new Coords(3, 8));

	assert([1,2,3]).equalsTo([1,2,3]);
	assert([1,"2",3]).notEqualsTo([1,2,3]);
	assert([1,2]).notEqualsTo([1,2,3]);
	assert([1,2,3]).notEqualsTo([1,2]);
	assert([{a: 5}, {b: 10}]).equalsTo([{a: 5}, {b: 10}]);
	assert([{a: 5}, {b: 10}]).notEqualsTo([{b: 10}, {a: 5}]);
	assert([{a: 5, b: {c: 15}}, {b: 10}]).notEqualsTo([{a: 5, b: {c: 16}}, {b: 10}]);
	assert({a: [1,2,3]}).notEqualsTo({a: [1,3,4]});

	assert(new Set([1,3,2])).equalsTo(new Set([1,2,3]));
	assert(new Set([1,2,3])).equalsTo(new Set([1,2,3]));
	assert(new Set([obj])).equalsTo(new Set([obj]));
	assert(new Set([{a: 5}])).notEqualsTo(new Set([{a: 5}]));
	assert(new Set([{a: 5}])).notEqualsTo(new Set([{b: 10}]));

	let sym = Symbol("z")
	assert(new Map([[1, 1],["a", sym],[sym, 2]] as MapPairs)).equalsTo(new Map([[1, 1],["a", sym],[sym, 2]] as MapPairs));
	assert(new Map([["1", 1]])).notEqualsTo(new Map([[1, 1]]));
	assert(new Map([["1", {a: 5}]])).notEqualsTo(new Map([[1, {a: 5}]]));

	assert(new Set([1,3,2])).notEqualsTo(new Map([[1, 1],["a", 3],[sym, 2]] as MapPairs));
	assert(new Set()).notEqualsTo(new Map());
});

test("fail_empty_object_not_equals", assert => assert({}).notEqualsTo({}))
test("fail_empty_object_equals", assert => assert({}).equalsTo({a: 5, b: 10}))
test("fail_empty_object_equals_reverse", assert => assert({a: 5, b: 10}).equalsTo({}))
test("fail_different_plain_nonintersecting_objects_equals", assert => assert({a: 5}).equalsTo({b: 5}))
test("fail_different_plain_object_equals", assert => assert({a: 5, b: 10}).notEqualsTo({a: 5, b: 10}))
test("fail_plain_object_not_equals", assert => assert({a: 5, b: 10}).equalsTo({a: 5, b: 11}))
test("fail_nested_object_equals", assert => assert({a: 5, b: 10, c: {d: 15, e: { j: 20 }}}).notEqualsTo({a: 5, b: 10, c: {d: 15, e: { j: 20 }}}));
test("fail_nested_object_not_equals", assert => assert({a: 5, b: 10, c: {d: 15, e: { j: 20 }}}).equalsTo({a: 5, b: 10, c: {d: 15, e: { j: 21 }}}));

test("fail_symbol_equals", assert => assert(Symbol("x")).equalsTo(Symbol("x")))
test("fail_symbolfor_not_equals", assert => assert(Symbol.for("x")).notEqualsTo(Symbol.for("x")))
test("fail_symbol_as_field_self", assert => {
	let obj = {x: Symbol("x")};
	assert(obj).notEqualsTo(obj);
})
test("fail_symbol_as_field_another", assert => assert({x: Symbol("x")}).equalsTo({x: Symbol("x")}))

test("fail_set_not_equals_a", assert => assert(new Set([1,3,2])).notEqualsTo(new Set([1,2,3])));
test("fail_set_not_equals_b", assert => assert(new Set([1,2,3])).notEqualsTo(new Set([1,2,3])));
test("fail_set_not_equals_nested_symbol", assert => {
	let obj = {x: Symbol("x")};
	assert(new Set([obj])).notEqualsTo(new Set([obj]));
});
test("fail_set_equals_plain_object", assert => assert(new Set([{a: 5}])).equalsTo(new Set([{a: 5}])));

test("fail_class_not_equals", assert => assert(new Point(3, 8)).notEqualsTo(new Point(3, 8)));
test("fail_class_fields_equals", assert => assert(new Point(3, 8)).equalsTo(new Point(3, 7)));
test("fail_class_equals_object", assert => assert(new Point(3, 8)).equalsTo({x: 3, y: 8}));
test("fail_class_equals_other_class", assert => assert(new Point(3, 8)).equalsTo(new Coords(3, 8)));

test("fail_array_not_equals", assert => assert([1,2,3]).notEqualsTo([1,2,3]));
test("fail_array_equals_a", assert => assert([1,2,3]).equalsTo([1,2]));
test("fail_array_equals_b", assert => assert([1,2]).equalsTo([1,2,3]));
test("fail_array_equals_c", assert => assert([1,"2",3]).equalsTo([1,2,3]));
test("fail_array_equals_d", assert => assert([1,2,3]).equalsTo([1,"2",3]));
test("fail_array_equals_w", assert => assert([1,2,3]).equalsTo([1,3,4]));

test("fail_array_swap_equals", assert => assert([{a: 5}, {b: 10}]).equalsTo([{b: 10}, {a: 5}]));
test("fail_array_nested_equals", assert => assert([{a: 5, b: {c: 15}}, {b: 10}]).equalsTo([{a: 5, b: {c: 16}}, {b: 10}]));
test("fail_nested_array_equals", assert => assert({a: [1,2,3]}).equalsTo({a: [1,3,4]}));

test("fail_map_equals_a", assert => assert(new Map([["1", 1]] as MapPairs)).equalsTo(new Map([[1, 1]] as MapPairs)));
test("fail_map_equals_b", assert => assert(new Map([["1", {a: 5}]] as MapPairs)).equalsTo(new Map([[1, {a: 5}]] as MapPairs)));
test("fail_map_not_equals", assert => {
	let sym = Symbol("z")
	assert(new Map([[1, 1],["a", sym],[sym, 2]] as MapPairs)).notEqualsTo(new Map([[1, 1],["a", sym],[sym, 2]] as MapPairs))
});
test("fail_map_equals_set", assert => {
	let sym = Symbol("z")
	assert(new Set([1,3,2])).equalsTo(new Map([[1, 1],["a", 3],[sym, 2]] as MapPairs))
});
test("fail_map_equals_set_empty", assert => assert(new Set()).equalsTo(new Map()));