import {performance} from "perf_hooks"
import {deepDiffToString, getDeepDiff} from "deep_diff"
import {ClamsensorExceptionSpecification, getExceptionDiff} from "exception_diff"
import {ClamsensorAssertor, ClamsensorAssertorBoundBase, ClamsensorAssertorBoundForNumber, ClamsensorAssertorBoundForPromiseOrFn, ClamsensorAssertorBoundForString, ClamsensorPromiseOrFn, ClamsensorValuePromiseIfIsPromise} from "assertor_types"
import {anyToString} from "utils"
import {ClamsensorTestRunner} from "main"

function fail(msg: string): never {
	throw new Error(msg)
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any does not really go anywhere as function type is explicitly defined
export const ClamsensorDefaultAssertor: ClamsensorAssertor = (value: unknown): any => {
	switch(typeof(value)){
		case "string": return new ClamsensorAssertorBoundForStringImpl(value)
		case "number": return new ClamsensorAssertorBoundForNumberImpl(value)
		case "function":
			return new ClamsensorAssertorBoundForPromiseOrFnImpl(value as () => unknown)
		case "object":
			if(value && value instanceof Promise){
				return new ClamsensorAssertorBoundForPromiseOrFnImpl(value)
			}

			return new ClamsensorAssertorBoundBaseImpl(value)
		default: return new ClamsensorAssertorBoundBaseImpl(value)
	}
}

// without "extends unknown" here typechecker behaves strangely sometimes
// for example, this.value === true is considered error
class ClamsensorAssertorBoundBaseImpl<T extends unknown> implements ClamsensorAssertorBoundBase {

	constructor(protected readonly value: T) {}

	isTrue(): void {
		this.value === true || fail(`Expected ${this.value} to be true, but it's not.`)
	}

	isNotTrue(): void {
		this.value !== true || fail(`Expected ${this.value} not to be true, but it is.`)
	}

	isTruthy(): void {
		!!this.value || fail(`Expected ${this.value} to be truthy, but it's not.`)
	}

	isFalsy(): void {
		!this.value || fail(`Expected ${this.value} to be falsy, but it's not.`)
	}

	equalsTo(otherValue: unknown): void {
		let diff = getDeepDiff(this.value, otherValue)
		if(diff){
			throw new Error("Expected values to be the same, but they are not: " + deepDiffToString(diff))
		}
	}

	notEqualsTo(otherValue: unknown): void {
		let diff = getDeepDiff(this.value, otherValue)
		if(!diff){
			// little ugly stringification here
			// maybe I'll fix it later, when I know what exactly do I want here
			throw new Error("Expected values not to be the same, but they are: " + anyToString(this.value))
		}
	}

}

class ClamsensorAssertorBoundForStringImpl extends ClamsensorAssertorBoundBaseImpl<string> implements ClamsensorAssertorBoundForString {

	constructor(value: string) {
		super(value)
	}

	matches(regExp: RegExp): void {
		this.value.match(regExp) || fail(`Expected ${this.value} to match ${regExp}, but it's not.`)
	}

	notMatches(regExp: RegExp): void {
		!this.value.match(regExp) || fail(`Expected ${this.value} not to match ${regExp}, but it is.`)
	}

	contains(otherString: string): void {
		this.value.indexOf(otherString) >= 0 || fail(`Expected ${this.value} to contain ${otherString}, but it's not.`)
	}

	notContains(otherString: string): void {
		this.value.indexOf(otherString) < 0 || fail(`Expected ${this.value} not to contain ${otherString}, but it is.`)
	}

	startsWith(otherString: string): void {
		this.value.indexOf(otherString) === 0 || fail(`Expected ${this.value} to start with ${otherString}, but it's not.`)
	}

	notStartsWith(otherString: string): void {
		this.value.indexOf(otherString) !== 0 || fail(`Expected ${this.value} not to start with ${otherString}, but it is.`)
	}

	endsWith(otherString: string): void {
		this.value.indexOf(otherString) === (this.value.length - otherString.length)
			|| fail(`Expected ${this.value} to end with ${otherString}, but it's not.`)
	}

	notEndsWith(otherString: string): void {
		this.value.indexOf(otherString) !== (this.value.length - otherString.length)
			|| fail(`Expected ${this.value} not to end with ${otherString}, but it is.`)
	}
}

class ClamsensorAssertorBoundForNumberImpl extends ClamsensorAssertorBoundBaseImpl<number> implements ClamsensorAssertorBoundForNumber {
	constructor(value: number) {
		super(value)
	}

	biggerThan(otherNumber: number): void {
		this.value > otherNumber || fail(`Expected ${this.value} to be bigger than ${otherNumber}, but it's not.`)
	}

	smallerThan(otherNumber: number): void {
		this.value < otherNumber || fail(`Expected ${this.value} to be smaller than ${otherNumber}, but it's not.`)
	}

	biggerOrEqualsTo(otherNumber: number): void {
		this.value >= otherNumber || fail(`Expected ${this.value} to be bigger than or equal to ${otherNumber}, but it's not.`)
	}

	smallerOrEqualsTo(otherNumber: number): void {
		this.value <= otherNumber || fail(`Expected ${this.value} to be smaller than or equal to ${otherNumber}, but it's not.`)
	}
}

function formatTime(value: number): string {
	let precision = ClamsensorTestRunner.roundTimeTo || 1
	value = Math.round(value / precision) * precision
	return value + ""
}

class ClamsensorAssertorBoundForPromiseOrFnImpl<R, P extends ClamsensorPromiseOrFn<R>> extends ClamsensorAssertorBoundBaseImpl<P> implements ClamsensorAssertorBoundForPromiseOrFn<R, P> {
	constructor(value: P) {
		super(value)
	}

	private isFn<T>(x: ClamsensorPromiseOrFn<T>): x is () => T {
		return typeof(x) === "function"
	}

	private verifyException(spec: ClamsensorExceptionSpecification, ex: Error): void {
		let diff = getExceptionDiff(spec, ex)
		if(diff){
			throw new Error("Incorrect exception is thrown: " + diff)
		}
	}

	private getNoExceptionException(spec: ClamsensorExceptionSpecification): Error {
		return new Error(`Expected exception (${spec}) to be thrown, but it was not.`)
	}

	private async timeableToPromise<T>(action: ClamsensorPromiseOrFn<T>): Promise<[T, number]> {
		let time = performance.now()
		let res = await Promise.resolve((typeof(action) === "function" ? action() : action))
		time = performance.now() - time
		return [res, time]
	}

	private async getTimingOfBoth(x: number | ClamsensorPromiseOrFn<unknown>): Promise<[R, number, number]> {
		if(typeof(x) === "number"){
			let [res, resultTime] = await this.timeableToPromise<R>(this.value)
			return [res, resultTime, x]
		} else {
			let timeExpected: number
			let timeGot: number
			let res: R
			// we cannot run both functions simultaneously because if one of them is synchronous time measurement won't be right
			// but! if one or both arguments are already launched promises, we have to await them first
			// otherwise our time measurement will be incorrect
			// same goes for getTimingOfOne()
			if(isPromise(x)){
				if(isPromise(this.value)){
					[[, timeExpected], [res, timeGot]] = await Promise.all([
						this.timeableToPromise(x),
						this.timeableToPromise<R>(this.value)
					])
				} else {
					[, timeExpected] = await this.timeableToPromise(x);
					[res, timeGot] = await this.timeableToPromise<R>(this.value)
				}
			} else {
				[res, timeGot] = await this.timeableToPromise<R>(this.value);
				[, timeExpected] = await this.timeableToPromise(x)
			}

			return [res, timeGot, timeExpected]
		}
	}

	private limitPromiseTime<T = unknown>(prom: Promise<[T, number]>, timeLimit: number): Promise<TimeLimitedPromiseResult<T>> {
		return Promise.race([
			prom.then(([result, time]) => ({inTime: true, time, result})),
			new Promise<TimeLimitedPromiseResult<T>>(ok => setTimeout(() => ok({inTime: false, time: timeLimit}), timeLimit))
		])
	}

	private async getTimingOfOne(x: number | ClamsensorPromiseOrFn<unknown>): Promise<TimeLimitedPromiseResult<R> & {timeExpected: number}> {
		if(typeof(x) === "number"){
			let res = await this.limitPromiseTime(this.timeableToPromise(this.value), x)

			// for synchronous functions, let's check that we actually returned early
			let inTime = res.inTime && x > res.time

			// cast here (and later) needed to ensure typescript that data matches constraints on result and inTime
			return {...res, inTime, timeExpected: x} as TimeLimitedPromiseResult<R> & {timeExpected: number}
		} else {

			let promRes: TimeLimitedPromiseResult<R>
			let timeExpected: number

			// see comments in getTimingOfBoth() about what exactly is happening here
			if(isPromise(x)){
				if(isPromise(this.value)){
					let testedPromise = this.timeableToPromise<R>(this.value);
					[, timeExpected] = await this.timeableToPromise(x)
					promRes = await this.limitPromiseTime<R>(testedPromise, timeExpected)
				} else {
					[, timeExpected] = await this.timeableToPromise(x)
					promRes = await this.limitPromiseTime(this.timeableToPromise(this.value), timeExpected)
				}
			} else if(isPromise(this.value)){
				// it's not possible because we will have to wait for synchronous function to end
				// and that will mess up our measurement of promise timing
				// OR we will have to wait for promise to end, but it possibly won't return at all, which is unacceptable
				throw new Error("Impossible to robustly measure time of potentially-neverending promise using potentially-blocking function as ethalon. Rewrite this assertion: if promise is guaranteed to return, use isSlower(); or, if ethalon function is not blocking, invoke it and pass resulting promise.")
			} else {
				[, timeExpected] = await this.timeableToPromise(x)
				promRes = await this.limitPromiseTime(this.timeableToPromise(this.value), timeExpected)
			}

			let inTime = promRes.inTime
			if(promRes.inTime){
				// for synchronous functions, let's check that we actually returned early
				inTime = timeExpected > promRes.time
			} else {
				promRes.time = Number.POSITIVE_INFINITY
			}

			return {...promRes, inTime, timeExpected} as TimeLimitedPromiseResult<R> & {timeExpected: number}
		}
	}

	async fasterThan(x: number | ClamsensorPromiseOrFn<unknown>): Promise<R> {
		let res = await this.getTimingOfOne(x)

		if(res.inTime){
			return res.result
		}

		throw new Error(`Timing check failed: function/promise failed to return in ${formatTime(res.timeExpected)} ms`)
	}


	async slowerThan(x: number | ClamsensorPromiseOrFn<unknown>): Promise<R> {
		let [callResult, timeGot, timeExpected] = await this.getTimingOfBoth(x)

		if(timeGot < timeExpected){
			throw new Error(`Timing check failed: ${formatTime(timeGot)} ms < ${formatTime(timeExpected)} ms, difference is ${formatTime(timeExpected - timeGot)} ms`)
		}

		return callResult
	}

	async willNotReturnFasterThan(x: number | ClamsensorPromiseOrFn<unknown>): Promise<void> {
		let {inTime, time, timeExpected} = await this.getTimingOfOne(x)
		if(inTime){
			throw new Error(`Timing check failed: ${formatTime(time)} ms < ${formatTime(timeExpected)} ms, difference is ${formatTime(timeExpected - time)} ms`)
		}
	}

	throws(exceptionDescription: ClamsensorExceptionSpecification): ClamsensorValuePromiseIfIsPromise<void, P> {
		// ugly typecasts below
		// could not get typescript to understand implicitly what I'm about to do
		// at least they are contained inside this method
		try {
			const promOrValue = (this.isFn(this.value) ? this.value() : this.value) as R | Promise<R>
			if(promOrValue && typeof(promOrValue) === "object" && promOrValue instanceof Promise){
				return new Promise<void>((ok, bad) => {
					promOrValue.then(() => {
						bad(this.getNoExceptionException(exceptionDescription))
					}, e => {
						try {
							this.verifyException(exceptionDescription, e)
							ok()
						} catch(ee){
							bad(ee)
						}
					})
				}) as ClamsensorValuePromiseIfIsPromise<void, P>
			}
		} catch(e){
			this.verifyException(exceptionDescription, e)
			return undefined as ClamsensorValuePromiseIfIsPromise<void, P>
		}

		throw this.getNoExceptionException(exceptionDescription)
	}
}

function isPromise(x: unknown): x is Promise<unknown> {
	return !!x && typeof(x) === "object" && x instanceof Promise
}

interface DatafulTimeLimitedPromiseResult<T> {
	inTime: true
	result: T
}

interface DatalessTimeLimitedPromiseResult {
	inTime: false
}

type TimeLimitedPromiseResult<T> = (DatafulTimeLimitedPromiseResult<T> | DatalessTimeLimitedPromiseResult) & {time: number}