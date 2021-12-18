import {Imploder} from "@nartallax/imploder"
import {runBundle} from "test/bundle_runner"
import {promises as Fs} from "fs"
import * as Path from "path"
import {default as dflt} from "main"

export * from "main"
export default dflt // default is not re-exported when export * from; re-exporting it explicitly

let failedProjects = new Set<string>()
let passedProjects = new Set<string>()

export async function main(): Promise<void | never> {
	try {
		await unwrappedMain()
	} catch(e){
		console.error("Testing totally failed in unexpected way: " + e.stack)
		process.exit(1)
	}
}

async function unwrappedMain() {
	if(process.argv[2]){
		await runTestProjectWrapped(process.argv[2])
	} else {
		let allTests = await Fs.readdir("./test_projects")
		for(let testName of allTests){
			await runTestProjectWrapped(testName)
		}
	}
	finishTesting()
}

function finishTesting() {
	if(failedProjects.size === 0){
		console.error(`All ${passedProjects.size} tests are passed successfully.`)
	} else {
		console.error(`Testing failed: ${failedProjects.size} of ${failedProjects.size + passedProjects.size} test projects failed.`)
		console.error(`Those projects are: ${[...failedProjects].join(", ")}`)
		process.exit(1)
	}
}

async function runTestProjectWrapped(name: string) {
	try {
		await runTestProject(name)
		passedProjects.add(name)
	} catch(e){
		console.error(`Test project ${name} failed: ${e.stack}`)
		failedProjects.add(name)
	}
}

async function rmGenerated(tsconfigPath: string): Promise<void> {
	try {
		await Fs.unlink(Path.resolve(Path.dirname(tsconfigPath), "./test_generated.ts"))
	} catch(e){
		if(e.code !== "ENOENT"){
			throw e
		}
	}
}

async function getExpectedExitCode(tsconfigPath: string): Promise<number> {
	try {
		let str = await Fs.readFile(Path.resolve(Path.dirname(tsconfigPath), "./expected_exit_code.txt"), "utf8")
		return parseInt(str.trim())
	} catch(e){
		if(e.code === "ENOENT"){
			return 0
		}
		throw e
	}
}

async function runTestProject(name: string) {
	let tsconfigPath = Path.join(Path.resolve("./test_projects"), name, "tsconfig.json")

	await rmGenerated(tsconfigPath)

	try {
		let context = await Imploder.runFromTsconfig(tsconfigPath, {profile: "test"})
		if(!context.compiler.lastBuildWasSuccessful){
			throw new Error("Build was not successful, won't run tests.")
		}
		let {stdout, stderr, code, signal} = await runBundle(context.config.outFile)

		if(stdout){
			throw new Error("No stdout expected, but got following:\n" + stdout)
		}

		let expectedStderr = await Fs.readFile(Path.resolve(Path.dirname(context.config.tsconfigPath), "./stderr.txt"), "utf8")
		if(stderr !== expectedStderr){
			throw new Error(`Stderr is incorrect: expected\n${expectedStderr}\n, but got\n${stderr}`)
		}

		if(code !== await getExpectedExitCode(tsconfigPath)){
			throw new Error(`Bundle process exited with unexpected code or signal: code = ${code}, signal = ${signal}`)
		}
	} finally {
		try {
			await rmGenerated(tsconfigPath)
		} catch(e){
			// no throw from finally
		}
	}
}