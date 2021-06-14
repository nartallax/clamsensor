import {ClamsensorExceptionSpecification} from "exception_diff";

export type ClamsensorPromiseOrFn<R> = Promise<R> | (() => R | Promise<R>);

/** If P is promise or function thath returns promise, this type is Promise<R>; otherwise, it's just R
 * 
 * @param R type of result value
 * @param P promise or some function
 */
export type ClamsensorValuePromiseIfIsPromise<R, P extends ClamsensorPromiseOrFn<any>> = 
	P extends Promise<any>? Promise<R>: 
	P extends () => Promise<any>? Promise<R>:
	R;

// not so beautiful here
// I had to manually unroll PromiseOrFn, otherwise R is not inferred
// also order of overloads matter
export type ClamsensorAssertor =
	(<R>(someValue: () => Promise<R>) => ClamsensorAssertorBoundForPromiseOrFn<R, () => Promise<R>>) &
	(<R>(someValue: () => R) => ClamsensorAssertorBoundForPromiseOrFn<R, () => R>) &
	(<R>(someValue: Promise<R>) => ClamsensorAssertorBoundForPromiseOrFn<R, Promise<R>>) &

	((someValue: string) => ClamsensorAssertorBoundForString) &
	((someValue: number) => ClamsensorAssertorBoundForNumber) &
	((someValue: unknown) => ClamsensorAssertorBoundBase);


export interface ClamsensorAssertorBoundBase {
	isTrue(): void;
	isNotTrue(): void;
	isTruthy(): void;
	isFalsy(): void;
	equalsTo(otherValue: unknown): void;
	notEqualsTo(otherValue: unknown): void;
}

export interface ClamsensorAssertorBoundForString extends ClamsensorAssertorBoundBase {
	matches(regExp: RegExp): void;
	notMatches(regExp: RegExp): void;
	contains(otherString: string): void;
	notContains(otherString: string): void;
	startsWith(otherString: string): void;
	notStartsWith(otherString: string): void;
	endsWith(otherString: string): void;
	notEndsWith(otherString: string): void;
}

export interface ClamsensorAssertorBoundForNumber extends ClamsensorAssertorBoundBase {
	biggerThan(otherNumber: number): void;
	smallerThan(otherNumber: number): void;
	biggerOrEqualsTo(otherNumber: number): void;
	smallerOrEqualsTo(otherNumber: number): void;
}

export interface ClamsensorAssertorBoundForPromiseOrFn<R, T extends ClamsensorPromiseOrFn<R>> extends ClamsensorAssertorBoundBase {
	fasterThan(otherAction: ClamsensorPromiseOrFn<unknown>): Promise<R>
	fasterThan(timeMilliseconds: number): Promise<R>
	slowerThan(otherAction: ClamsensorPromiseOrFn<unknown>): Promise<R>
	slowerThan(timeMilliseconds: number): Promise<R>
	throws(exceptionDescription: ClamsensorExceptionSpecification): ClamsensorValuePromiseIfIsPromise<void, T>
}