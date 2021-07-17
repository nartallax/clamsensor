import {ClamsensorTestRunner, ClamsensorDefaultAssertor} from "../../target/clamsensor_test";

export let birdCount = 0;

export const testWithSetupA = ClamsensorTestRunner.createTestDefinerFunction({
	getAssertor: () => ClamsensorDefaultAssertor,
	beforeTest: descr => {
		birdCount++;
		console.error("Setup happened for " + descr.name + " in " + descr.moduleName)
	},
	afterTest: descr => {
		birdCount--;
		console.error("Cleanup happened for " + descr.name + " in " + descr.moduleName)
	}
})