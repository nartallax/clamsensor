import * as Process from "process"

export namespace Clamsensor {
	const nameStack: string[] = []

	const allTests: {
		name: string
		tester(): void | Promise<void>
	}[] = []

	export function describe(name: string, groupDescriber: () => void): void {
		nameStack.push(name)
		try {
			groupDescriber()
		} finally {
			nameStack.pop()
		}
	}

	export function test(name: string, tester: () => void | Promise<void>): void {
		allTests.push({
			name: [...nameStack, name].join(" > "),
			tester
		})
	}

	type TestRunningOptions = {
		readonly nameFilter?: string | RegExp
		readonly showStacks?: boolean
	}

	export async function runTests(options: TestRunningOptions = {}): Promise<void> {
		let tests = allTests
		if(options.nameFilter){
			if(options.nameFilter instanceof RegExp){
				const regexp = options.nameFilter
				tests = tests.filter(test => regexp.test(test.name))
			} else {
				const search = options.nameFilter.toLowerCase()
				tests = tests.filter(test => test.name.toLowerCase().includes(search))
			}
		}

		if(tests.length === 0){
			Process.stderr.write("No tests selected.\n")
			Process.exit(1)
		}

		const failedTests: string[] = []
		for(const test of tests){
			Process.stderr.write(test.name + "...")
			try {
				const result = test.tester()
				if(result instanceof Promise){
					await result
				}
				Process.stderr.write(" OK\n")
			} catch(e){
				let errStr: string
				if(options.showStacks && e instanceof Error){
					errStr = (e.stack + "") || (e + "")
				} else {
					errStr = e + ""
				}
				Process.stderr.write(" failed: " + errStr + "\n")
				failedTests.push(test.name)
			}
		}

		if(failedTests.length === 0){
			Process.stderr.write(`All ${tests.length} tests were successful.\n`)
		} else {
			Process.stderr.write(`Failed ${failedTests.length} tests (out of ${tests.length}):\n`)
			for(const failedTestName of failedTests){
				Process.stderr.write(`\t${failedTestName}\n`)
			}
			Process.exit(1)
		}
	}


	export async function runFromArgv(): Promise<void> {
		let argv = Process.argv.slice(2)

		function getArgvBool(value: string): boolean {
			const index = argv.indexOf(value)
			if(index < 0){
				return false
			}
			argv = [...argv.slice(0, index), ...argv.slice(index + 1)]
			return true
		}

		const showStacks = !getArgvBool("--no-stack-trace")
		const nameFilter = argv[0]

		runTests({nameFilter, showStacks})
	}
}

export const describe = Clamsensor.describe
export const test = Clamsensor.test