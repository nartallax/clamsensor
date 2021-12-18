import {ClamsensorTestCaseDefiner, ClamsensorVerifier, CLAMSENSOR_AUTOWIRED_TEST_MARKER} from "main"

let twoDig = (x: number) => (x > 9 ? "" : "0") + x
let threeDig = (x: number) => (x > 99 ? "" : "0") + twoDig(x)
let log = (x: string, noPrefix?: boolean) => logNoNewline(x + "\n", noPrefix)

let logNoNewline = (x: string, noPrefix?: boolean) => {
	if(!ClamsensorTestRunner.suppressDateTime && !noPrefix){
		let date = new Date()
		let dateStr = `${date.getFullYear()}.${twoDig(date.getMonth() + 1)}.${twoDig(date.getDate())} ${twoDig(date.getHours())}:${twoDig(date.getMinutes())}:${twoDig(date.getSeconds())}.${threeDig(date.getMilliseconds())}`
		x = dateStr + " " + x
	}

	process.stderr.write(x, "utf8")
}

export interface ClamsensorVerificationEntryDescription {
	name: string
	description: string
	moduleName: string
}

interface ClamsensorVerificationEntry extends ClamsensorVerificationEntryDescription {
	doVerify(): Promise<void>
}

export interface ClamsensorTestDefinerFunctionParams<T> {
	getAssertor(): T | Promise<T>
	beforeTest?(description: ClamsensorVerificationEntryDescription): void | Promise<void>
	afterTest?(description: ClamsensorVerificationEntryDescription): void | Promise<void>
}

export class ClamsensorTestRunner {

	private static knownTests: Set<ClamsensorVerificationEntry> = new Set()
	static suppressStacks = false
	static suppressDateTime = false
	static roundTimeTo = 0

	static createTestDefinerFunction<T>(params: ClamsensorTestDefinerFunctionParams<T>): CLAMSENSOR_AUTOWIRED_TEST_MARKER & ClamsensorTestCaseDefiner<T> {
		return (name: string, a: string | ClamsensorVerifier<T>, b?: ClamsensorVerifier<T> | string, c?: string): void => {
			let description: string
			let verifier: ClamsensorVerifier<T>
			let moduleName: string | undefined
			if(typeof(a) === "string"){
				description = a
				verifier = b as ClamsensorVerifier<T>
				moduleName = c
			} else {
				description = ""
				verifier = a
				moduleName = b as string
			}

			if(typeof(moduleName) !== "string" || !moduleName){
				throw new Error("Tester function is invoked without passing module name. This probably means that Clamsensor was not run as transformer at compile time.")
			}

			let verificationEntry: ClamsensorVerificationEntry = {
				name, description, moduleName,
				doVerify: async() => {
					let assertor = await Promise.resolve(params.getAssertor())
					if(params.beforeTest){
						await Promise.resolve(params.beforeTest(verificationEntry))
					}

					try {
						await Promise.resolve(verifier(assertor))
					} finally {
						if(params.afterTest){
							// only executing aftertest if test actually started to execute, i.e. beforetest part passed
							await Promise.resolve(params.afterTest(verificationEntry))
						}
					}
				}
			}

			this.knownTests.add(verificationEntry)
		}
	}

	private readonly failedTests: Set<ClamsensorVerificationEntry> = new Set()
	private readonly passedTests: Set<ClamsensorVerificationEntry> = new Set()

	static async main(): Promise<void | never> {
		try {
			await new ClamsensorTestRunner().unwrappedMain()
		} catch(e){
			log(e.message + "\n" + e.stack)
			process.exit(1)
		}
	}

	private matcherByArgVal(argValName: string, getMatcher: (value: string) => (test: ClamsensorVerificationEntry) => boolean): ((test: ClamsensorVerificationEntry) => boolean) | null {
		let index = process.argv.indexOf(argValName)
		if(index > 0){
			let value = process.argv[index + 1]
			if(!value){
				log("Value of argument " + argValName + " is not provided.")
				process.exit(1)
			}
			return getMatcher(value)
		}
		return null
	}

	private async unwrappedMain() {
		if(ClamsensorTestRunner.knownTests.size === 0){
			log("No tests defined. You need to have some tests defined first before you try to run tests.")
			process.exit(1)
		}

		let matchers = [
			this.matcherByArgVal("--by-name", value => entry => entry.name === value),
			this.matcherByArgVal("--by-name-prefix", value => entry => entry.name.startsWith(value)),
			this.matcherByArgVal("--by-name-regexp", value => {
				let regexp = new RegExp(value)
				return entry => !!entry.name.match(regexp)
			}),
			this.matcherByArgVal("--by-module", value => entry => entry.moduleName === value),
			this.matcherByArgVal("--by-module-prefix", value => entry => entry.moduleName.startsWith(value)),
			this.matcherByArgVal("--by-module-regexp", value => {
				let regexp = new RegExp(value)
				return entry => !!entry.moduleName.match(regexp)
			})
		].filter(x => !!x) as ((test: ClamsensorVerificationEntry) => boolean)[]

		await this.runMatching(test => matchers.length === 0 ? true : !matchers.find(matcher => !matcher(test)))

		if(this.passedTests.size === 0 && this.failedTests.size === 0){
			log(`0 tests are selected out of defined ${ClamsensorTestRunner.knownTests.size}. You probably did not meant this.`)
			process.exit(1)
		}

		if(this.failedTests.size > 0){
			log(`Testing completed: ${this.failedTests.size} / ${this.passedTests.size + this.failedTests.size} of tests are failed.`)
			log(`Failed tests are: ${[...this.failedTests].map(x => x.moduleName + ": " + x.name).join(", ")}`)
			process.exit(1)
		} else {
			log(`Testing completed: all ${this.passedTests.size} tests are passed`)
			if(this.passedTests.size < ClamsensorTestRunner.knownTests.size){
				log(`(note that there are ${ClamsensorTestRunner.knownTests.size - this.passedTests.size} more tests that was not run in this testing session)`)
			}
		}
	}

	private async runMatching(matcher: (entry: ClamsensorVerificationEntry) => boolean) {
		let appliedTests: ClamsensorVerificationEntry[] = []
		for(let test of ClamsensorTestRunner.knownTests){
			if(!matcher(test)){
				continue
			}

			appliedTests.push(test)
		}

		appliedTests.sort((a, b) => {
			let aName = a.moduleName + " " + a.name + " " + a.description
			let bName = b.moduleName + " " + b.name + " " + b.description
			return aName < bName ? -1 : aName > bName ? 1 : 0
		})

		log("Testing started. Will run " + appliedTests.length + " tests.")

		for(let test of appliedTests){
			logNoNewline(`${test.moduleName}: ${test.name}... `)
			try {
				await test.doVerify()
				this.passedTests.add(test)
				log("OK", true)
			} catch(e){
				log(`fail: ${ClamsensorTestRunner.suppressStacks ? e.message : e.stack}`, true)
				this.failedTests.add(test)
			}
		}
	}

}