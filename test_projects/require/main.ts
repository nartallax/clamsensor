import {test, ClamsensorAssertor} from "../../target/clamsensor_test";

const theImploder = require("@nartallax/imploder");
void theImploder;

function doRequire(assert: ClamsensorAssertor): void {
	let imploder = require("@nartallax/imploder");
	assert(typeof(imploder.Imploder.isContext)).equalsTo("function");
}

test("require", assert => {
	let imploder = require("@nartallax/imploder");
	assert(typeof(imploder.Imploder.isContext)).equalsTo("function");
	doRequire(assert);
});

test("will fail", () => {
	test("nope", () => {});
})