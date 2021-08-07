import {test} from "../../target/clamsensor_test";

function sleep(ms: number): Promise<void> {
	return new Promise(ok => setTimeout(ok, ms));
}

// just for testing, to emulate long-running syncronous function
function sleepSync(ms: number): void {
	let date = Date.now();
	let x = 0;
	while(Date.now() < date + ms){
		x++;
	}

	void x;
}

void sleepSync;

test("good functions", async assert => {
	await Promise.all([
		assert(sleep(100)).fasterThan(200),
		assert(sleep(100)).slowerThan(50),

		assert(sleep(100)).fasterThan(sleep(200)),
		assert(() => sleep(100)).fasterThan(() => sleep(200)),
		//assert(sleep(100)).fasterThan(() => sleep(200)),
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
		})()).throws(/^([Nn]o){2,4}$/),

		assert(() => sleep(Math.pow(2, 31) - 1)).willNotReturnFasterThan(50),
		assert(() => sleep(Math.pow(2, 31) - 1)).willNotReturnFasterThan(() => sleep(50)),
	]);
});

// so many tests - because timing testers are tricky
// and promise is not equal to function that returns promise
test("sync timers", async assert => {
	await assert(() => sleep(50)).fasterThan(() => sleepSync(100));
	//await assert(sleep(50)).fasterThan(() => sleepSync(100));
	await assert(() => sleepSync(50)).fasterThan(() => sleep(100));
	await assert(() => sleepSync(50)).fasterThan(sleep(100));
	await assert(() => sleepSync(50)).fasterThan(() => sleepSync(100));
	await assert(() => sleepSync(50)).fasterThan(100);

	await assert(() => sleep(100)).slowerThan(() => sleepSync(50));
	await assert(sleep(100)).slowerThan(() => sleepSync(50));
	await assert(() => sleepSync(100)).slowerThan(() => sleep(50));
	await assert(() => sleepSync(100)).slowerThan(sleep(50));
	await assert(() => sleepSync(100)).slowerThan(() => sleepSync(50));
	await assert(() => sleepSync(100)).slowerThan(50);

	await assert(() => sleep(Math.pow(2, 31) - 1)).willNotReturnFasterThan(() => sleepSync(50));
	await assert(() => sleepSync(100)).willNotReturnFasterThan(() => sleep(50));
	await assert(() => sleepSync(100)).willNotReturnFasterThan(sleep(50));
	await assert(() => sleepSync(100)).willNotReturnFasterThan(() => sleepSync(50));
	await assert(() => sleepSync(100)).willNotReturnFasterThan(50);
});

test("sync_timer_fail_1", assert => assert(() => sleep(100)).fasterThan(() => sleepSync(50)));
test("sync_timer_fail_2", assert => assert(sleep(100)).fasterThan(() => sleepSync(50)));
test("sync_timer_fail_3", assert => assert(() => sleepSync(100)).fasterThan(() => sleep(50)));
test("sync_timer_fail_4", assert => assert(() => sleepSync(100)).fasterThan(sleep(50)));
test("sync_timer_fail_5", assert => assert(() => sleepSync(100)).fasterThan(() => sleepSync(50)));
test("sync_timer_fail_6", assert => assert(() => sleepSync(100)).fasterThan(50));
test("sync_timer_fail_7", assert => assert(() => sleep(50)).slowerThan(() => sleepSync(100)));
test("sync_timer_fail_8", assert => assert(sleep(50)).slowerThan(() => sleepSync(100)));
test("sync_timer_fail_9", assert => assert(() => sleepSync(50)).slowerThan(() => sleep(100)));
test("sync_timer_fail_10", assert => assert(() => sleepSync(50)).slowerThan(sleep(100)));
test("sync_timer_fail_11", assert => assert(() => sleepSync(50)).slowerThan(() => sleepSync(100)));
test("sync_timer_fail_12", assert => assert(() => sleepSync(50)).slowerThan(100));
test("sync_timer_fail_13", assert => assert(() => sleep(50)).willNotReturnFasterThan(() => sleepSync(100)));
test("sync_timer_fail_14", assert => assert(sleep(50)).willNotReturnFasterThan(() => sleepSync(100)));
test("sync_timer_fail_15", assert => assert(() => sleepSync(50)).willNotReturnFasterThan(() => sleep(100)));
test("sync_timer_fail_16", assert => assert(() => sleepSync(50)).willNotReturnFasterThan(sleep(100)));
test("sync_timer_fail_17", assert => assert(() => sleepSync(50)).willNotReturnFasterThan(() => sleepSync(100)));
test("sync_timer_fail_18", assert => assert(() => sleepSync(50)).willNotReturnFasterThan(100));

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