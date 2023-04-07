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
			process.stderr.write("No tests selected.\n")
			process.exit(1)
		}

		const failedTests: string[] = []
		for(const test of tests){
			process.stderr.write(test.name + "...")
			try {
				const result = test.tester()
				if(result instanceof Promise){
					await result
				}
				process.stderr.write(" OK\n")
			} catch(e){
				process.stderr.write(" failed: " + e)
				failedTests.push(test.name)
			}
		}

		if(failedTests.length === 0){
			process.stderr.write(`All ${tests.length} tests were successful.\n`)
		} else {
			process.stderr.write(`Failed ${failedTests.length} tests (out of ${tests.length}):\n`)
			for(const failedTestName of failedTests){
				process.stderr.write(`\t${failedTestName}\n`)
			}
			process.exit(1)
		}
	}

	export async function runFromArgv(): Promise<void> {
		runTests({nameFilter: process.argv[2]})
	}
}

export const describe = Clamsensor.describe
export const test = Clamsensor.test