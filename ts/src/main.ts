import type {Imploder} from "@nartallax/imploder";
import {ClamsensorDefaultAssertor} from "assertor_impl";
import {ClamsensorAssertor} from "assertor_types";
import {ClamsensorTestRunner} from "runner";
import {ClamsensorTransformerFactory, ClamsensorTransformerParams} from "transformer";

export default function(context: Imploder.Context, params?: ClamsensorTransformerParams): Imploder.CustomTransformerFactory {
	return ClamsensorTransformerFactory.create(context, params);
}

export type ClamsensorVerifier<T = ClamsensorAssertor> = (assertor: T) => void | Promise<void>;

export type ClamsensorTestCaseDefiner<T = ClamsensorAssertor> = 
	((name: string, verifier: ClamsensorVerifier<T>) => void) &
	((name: string, description: string, verifier: ClamsensorVerifier<T>) => void)

/** This is marker interface.
 * All top-level function invocations with this marker will be threated as test case definitions
 * Modules containing such invocations will be loaded when testing
 * It is also implied that function marked with this marker will add some tests to the test runner.
 */
export interface CLAMSENSOR_AUTOWIRED_TEST_MARKER {}

export const test = ClamsensorTestRunner.createTestDefinerFunction({
	getAssertor: () => ClamsensorDefaultAssertor
})

export {ClamsensorTestRunner, ClamsensorDefaultAssertor};