import {promises as Fs} from "fs"
import * as Path from "path"

async function getFileNamesRecursively(dirPath: string, result: string[] = []): Promise<string[]> {
	const subResults = (await Fs.readdir(dirPath)).map(name => Path.resolve(dirPath, name))
	await Promise.all(subResults.map(async subPath => {
		const stat = await Fs.stat(subPath)
		if(stat.isDirectory()){
			await getFileNamesRecursively(subPath, result)
		} else {
			result.push(subPath)
		}
	}))
	return result
}

async function main(): Promise<void> {
	const [,, testDirPath, resultPath] = process.argv
	if(typeof(testDirPath) !== "string" || typeof(resultPath) !== "string"){
		console.error("Expected argument: testDirPath resultPath")
		process.exit(1)
	}

	const isAddingRunCode = !process.argv.includes("--no-run")

	await Fs.mkdir(Path.dirname(resultPath), {recursive: true})

	const targetFiles = (await getFileNamesRecursively(testDirPath)).filter(x => x.match(/^.+?\.test\.[tj]sx?$/i))
	const importPaths = targetFiles.map(targetFile =>
		Path.relative(Path.dirname(resultPath), targetFile)
			.replace(/\\/, "/")
			.replace(/\.[tj]sx?$/i, "")
	)

	let importCode = ""
	const exportCode: string[] = []
	let i = 0
	for(const importPath of importPaths){
		importCode += `import * as _${i} from ${JSON.stringify(importPath)}\n`
		exportCode.push("_" + i)
		i++
	}
	let resultCode = importCode + "\n\nconst allTestImports = [" + exportCode.join(", ") + "]\n\n void allTestImports;\n"
	if(isAddingRunCode){
		resultCode = "import {Clamsensor} from \"@nartallax/clamsensor\";\n\n" + resultCode
		resultCode += "\nClamsensor.runFromArgv();\n"
	}
	await Fs.writeFile(resultPath, resultCode)
}

main()