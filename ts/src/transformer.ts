import type {Imploder} from "@nartallax/imploder"
import * as tsc from "typescript"
import * as Path from "path"

export interface ClamsensorTransformerParams {
	generatedFilePath: string
	clamsensorModuleName?: string
	suppressStacks?: boolean
	suppressDateTime?: boolean
	roundTimeTo?: number
	useTestsInModule?: string | string[] // regexps
}

type VisitResult = null | tsc.Node | tsc.Node[]
let transformVisitRecursive = <T extends tsc.Node>(node: T, context: tsc.TransformationContext, visitor: (node: tsc.Node) => VisitResult): T => {

	let wrappedVisitor = (node: tsc.Node): tsc.Node | tsc.Node[] => {
		let res = visitor(node)
		if(res !== null){ // нода/ноды = вот результат трансформации, дальше по этой ветке идти не надо
			return res
		}
		// null = мы пока не нашли того, что ищем, продолжаем
		return tsc.visitEachChild(node, wrappedVisitor, context)

	}

	return tsc.visitEachChild(node, wrappedVisitor, context)
}

export class ClamsensorTransformerFactory {

	private readonly generatedFilePath: string
	private readonly moduleNameRegexps: RegExp[]

	static create(imploderContext: Imploder.Context, params: ClamsensorTransformerParams | undefined): Imploder.CustomTransformerFactory {
		if(!params || !params.generatedFilePath){
			throw new Error("Clamsensor requires generatedFilePath to be passed as a transformer parameter. It was not.")
		}

		let instance = new ClamsensorTransformerFactory(imploderContext, params)
		let result: Imploder.CustomTransformerFactory = transformContext => file => instance.transformFile(file, transformContext)
		result.onModuleDelete = instance.onModuleDelete.bind(instance)

		return result
	}

	constructor(private readonly imploderContext: Imploder.Context, private readonly opts: ClamsensorTransformerParams) {
		this.generatedFilePath = Path.resolve(Path.dirname(imploderContext.config.tsconfigPath), opts.generatedFilePath)
		let regexpStrs = typeof(opts.useTestsInModule) === "string" ? [opts.useTestsInModule] : opts.useTestsInModule || []
		this.moduleNameRegexps = regexpStrs.map(x => new RegExp(x))
	}

	private shouldTakeModule(name: string) {
		return this.moduleNameRegexps.length === 0 || !!this.moduleNameRegexps.find(reg => name.match(reg))
	}

	private readonly modules: Set<string> = new Set()

	private transformFile(fileNode: tsc.SourceFile, transformerContext: tsc.TransformationContext): tsc.SourceFile {
		if(Path.resolve(fileNode.fileName) === this.generatedFilePath){
			return fileNode
		}

		let moduleName = this.imploderContext.modulePathResolver.getCanonicalModuleName(fileNode.fileName)
		if(!this.shouldTakeModule(moduleName)){
			return fileNode
		}

		let typeChecker = this.imploderContext.compiler.program.getTypeChecker()
		let hasChange = false

		function typeHasMarker(type: tsc.Type, markerName: string): boolean {
			if(type.isUnionOrIntersection()){
				return !!type.types.find(x => typeHasMarker(x, markerName))
			}

			if(type.isClassOrInterface()){
				for(let decl of type.getSymbol()?.getDeclarations() || []){
					if(tsc.isInterfaceDeclaration(decl) && decl.name.text === markerName){
						return true
					}
				}
			}

			return false
		}


		fileNode = transformVisitRecursive(fileNode, transformerContext, node => {
			if(!tsc.isCallExpression(node)){
				// sometimes, top-level expressions are not really top-level
				// so we have to go deeper
				return null
			}

			let fn = node.expression
			let fnType = typeChecker.getTypeAtLocation(fn)
			if(!typeHasMarker(fnType, "CLAMSENSOR_AUTOWIRED_TEST_MARKER")){
				// in any case we won't go into function body
				// test definer invocations are only allowed at top-level
				return node
			}

			if(!this.modules.has(moduleName)){
				this.modules.add(moduleName)
				hasChange = true
			}
			let args = [...node.arguments, tsc.factory.createStringLiteral(moduleName)]
			return tsc.factory.updateCallExpression(node, node.expression, node.typeArguments, args)
		})

		if(hasChange){
			this.regenerateFile()
		}

		return fileNode
	}

	private regenerateFile() {
		let fileContent = `import {ClamsensorTestRunner} from "${this.opts.clamsensorModuleName || "@nartallax/clamsensor"}";\n`;
		[...this.modules].sort((a, b) => a > b ? 1 : a < b ? -1 : 0).forEach(module => {
			fileContent += `import "${module}";\n`
		})

		fileContent += "export function testMain(): void {\n"

		if(this.opts.suppressDateTime){
			fileContent += "\tClamsensorTestRunner.suppressDateTime = true;\n"
		}

		if(this.opts.suppressStacks){
			fileContent += "\tClamsensorTestRunner.suppressStacks = true;\n"
		}

		if(typeof(this.opts.roundTimeTo) === "number"){
			fileContent += `\tClamsensorTestRunner.roundTimeTo = ${this.opts.roundTimeTo};\n`
		}

		fileContent += "\tClamsensorTestRunner.main();\n}\n"

		tsc.sys.writeFile(this.generatedFilePath, fileContent)
		this.imploderContext.compiler.notifyFsObjectChange(this.generatedFilePath)
	}

	onModuleDelete(moduleName: string): void {
		this.modules.delete(moduleName)
	}

}