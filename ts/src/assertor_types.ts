import {ClamsensorExceptionSpecification} from "exception_diff"

export type ClamsensorPromiseOrFn<R> = Promise<R> | (() => R | Promise<R>)

/** If P is promise or function thath returns promise, this type is Promise<R>; otherwise, it's just R
 *
 * @param R type of result value
 * @param P promise or some function
 */
export type ClamsensorValuePromiseIfIsPromise<R, P extends ClamsensorPromiseOrFn<unknown>> =
	P extends Promise<unknown>? Promise<R>:
		P extends () => Promise<unknown>? Promise<R>:
			R

// not so beautiful here
// I had to manually unroll PromiseOrFn, otherwise R is not inferred
// also order of overloads matter
export type ClamsensorAssertor =
	(<R>(someValue: () => Promise<R>) => ClamsensorAssertorBoundForPromiseOrFn<R, () => Promise<R>>) &
	(<R>(someValue: () => R) => ClamsensorAssertorBoundForPromiseOrFn<R, () => R>) &
	(<R>(someValue: Promise<R>) => ClamsensorAssertorBoundForPromiseOrFn<R, Promise<R>>) &

	// not just string or number here for better union types support
	(<T extends string>(someValue: T) => ClamsensorAssertorBoundForString<T>) &
	(<T extends number>(someValue: T) => ClamsensorAssertorBoundForNumber<T>) &
	(<T extends string | number | boolean>(someValue: T) => ClamsensorAssertorBoundBase<T>) &
	((someValue: unknown) => ClamsensorAssertorBoundBase)


export interface ClamsensorAssertorBoundBase<T = unknown> {
	isTrue(): void
	isNotTrue(): void
	isTruthy(): void
	isFalsy(): void
	equalsTo(otherValue: T): void
	notEqualsTo(otherValue: T): void
}

export interface ClamsensorAssertorBoundForString<T extends string = string> extends ClamsensorAssertorBoundBase<T> {
	matches(regExp: RegExp): void
	notMatches(regExp: RegExp): void
	contains(otherString: string): void
	notContains(otherString: string): void
	startsWith(otherString: string): void
	notStartsWith(otherString: string): void
	endsWith(otherString: string): void
	notEndsWith(otherString: string): void
}

export interface ClamsensorAssertorBoundForNumber<T extends number = number> extends ClamsensorAssertorBoundBase<T> {
	biggerThan(otherNumber: number): void
	smallerThan(otherNumber: number): void
	biggerOrEqualsTo(otherNumber: number): void
	smallerOrEqualsTo(otherNumber: number): void
}

export interface ClamsensorAssertorBoundForPromiseOrFn<R, T extends ClamsensorPromiseOrFn<R>> extends ClamsensorAssertorBoundBase<T> {
	fasterThan(otherAction: ClamsensorPromiseOrFn<unknown>): Promise<R>
	fasterThan(timeMilliseconds: number): Promise<R>
	// slowerThan() waits for action resolution, and then returns result value (or throws, if returned faster)
	slowerThan(otherAction: ClamsensorPromiseOrFn<unknown>): Promise<R>
	slowerThan(timeMilliseconds: number): Promise<R>
	// willNotReturnFasterThan() waits only for other condition, and will not wait for action to complete
	// (only really usable for asyncronous actions, sync actions will behave as slowerThan())
	// note that otherAction is expected to return at all
	willNotReturnFasterThan(otherAction: ClamsensorPromiseOrFn<unknown>): Promise<void>
	willNotReturnFasterThan(timeMilliseconds: number): Promise<void>
	throws(exceptionDescription: ClamsensorExceptionSpecification): ClamsensorValuePromiseIfIsPromise<void, T>
}