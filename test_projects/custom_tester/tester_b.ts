import {ClamsensorTestRunner} from "../../target/clamsensor_test";

export const testWithSetupB = ClamsensorTestRunner.createTestDefinerFunction({
	getAssertor: () => (x: unknown) => {
		if(x === true){
			console.error("Good!");
		} else {
			throw new Error("Bad value!");
		}
	}
})