import {test} from "../../target/clamsensor_test";

function sleep(ms: number): Promise<void> {
	return new Promise(ok => setTimeout(ok, ms));
}

test("good functions", async assert => {
	await Promise.all([
		assert(sleep(100)).fasterThan(200),
		assert(sleep(100)).slowerThan(50),

		assert(sleep(100)).fasterThan(sleep(200)),
		assert(() => sleep(100)).fasterThan(() => sleep(200)),
		assert(sleep(100)).fasterThan(() => sleep(200)),
		assert(() => sleep(100)).fasterThan(sleep(200)),
		assert(sleep(200)).slowerThan(sleep(100)),
		assert(() => sleep(200)).slowerThan(() => sleep(100)),
		assert(sleep(200)).slowerThan(() => sleep(100)),
		assert(() => sleep(200)).slowerThan(sleep(100)),
		
		assert(() => { throw new Error("Nonono") }).throws("Nonono"),
		assert(() => { throw new Error("Nonono") }).throws(/^([Nn]o){2,4}$/),
		assert(() => { throw new Error("Nonono") }).throws(new Error("Nonono")),
		assert(async () => { 
			await sleep(150);
			throw new Error("Nonono");
		}).throws(/^([Nn]o){2,4}$/),
		assert((async () => { 
			await sleep(150);
			throw new Error("Nonono");
		})()).throws(/^([Nn]o){2,4}$/)
	])
});


test("fail_slower_than_a", assert => assert(sleep(100)).slowerThan(sleep(200)));
test("fail_slower_than_b", assert => assert(() => sleep(100)).slowerThan(() => sleep(200)));
test("fail_slower_than_c", assert => assert(sleep(100)).slowerThan(() => sleep(200)));
test("fail_slower_than_d", assert => assert(() => sleep(100)).slowerThan(sleep(200)));
test("fail_slower_than_e", assert => assert(sleep(100)).slowerThan(200));


test("fail_faster_than_a", assert => assert(sleep(200)).fasterThan(sleep(100)));
test("fail_faster_than_b", assert => assert(() => sleep(200)).fasterThan(() => sleep(100)));
test("fail_faster_than_c", assert => assert(sleep(200)).fasterThan(() => sleep(100)));
test("fail_faster_than_d", assert => assert(() => sleep(200)).fasterThan(sleep(100)));
test("fail_faster_than_e", assert => assert(sleep(100)).fasterThan(50));

test("fail_throws_anything", assert => { void assert; throw new Error("I'm an unexpected error!"); })
test("fail_faster_throws", assert => assert(async () => { throw new Error("Nonono") }).fasterThan(50))
test("fail_throws_str_match", assert => assert(() => { throw new Error("Nonono") }).throws("Niet!"))
test("fail_throws_reg_match", assert => assert(() => { throw new Error("Nonono") }).throws(/^Da!$/))
test("fail_throws_err_match", assert => assert(() => { throw new Error("Nonono") }).throws(new Error("Da!")))
test("fail_throws_async_reg_match_fn", assert => assert(async () => { 
	await sleep(150);
	throw new Error("Nonono");
}).throws(/^Da!$/))
test("fail_throws_async_reg_match_promise", assert => assert((async () => { 
	await sleep(150);
	throw new Error("Nonono");
})()).throws(/^Da!$/));