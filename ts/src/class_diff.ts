export interface ClassDiff {
	classAName: string;
	noClassA?: boolean;
	classBName: string;
	noClassB?: boolean;
}

export function getClassDiff(a: unknown, b: unknown): ClassDiff | null{
	if(typeof(a) !== "object" || typeof(b) !== "object"){
		throw new Error(`Trying to check for class-diff an non-objects (objects of type ${typeof(a)} and ${typeof(b)})`);
	}

	if(a === b){
		return null;
	}

	if(!a || !b){
		throw new Error("Expected both values to be objects, got " + a + " and " + b);
	}

	let ctrA = a.constructor;
	let ctrB = b.constructor;
	if(ctrA === ctrB){
		return null;
	}

	// non-function constructors could be achieved through Object.create(null, {}) for example
	let aFn = typeof(ctrA) === "function";
	let bFn = typeof(ctrB) === "function"
	return {
		classAName: aFn? ctrA.name: `<${ctrA}>`,
		classBName: bFn? ctrB.name: `<${ctrB}>`,
		noClassA: !aFn,
		noClassB: !bFn
	}
}

export function classDiffToString(d: ClassDiff): string {
	let res = `classes are different: ${d.classAName} vs ${d.classBName}`;
	if(d.classAName === d.classBName && !d.noClassA && !d.noClassB){
		res += " (those two classes have the same name)";
	}
	return res;
}