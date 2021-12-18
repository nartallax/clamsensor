import {getClassDiff} from "class_diff"
import {anyToString} from "utils"

export interface DeepDiff {
	path: string
	valueA: string
	valueB: string
}

export function deepDiffToString(d: DeepDiff): string {
	let res = ""
	if(d.path){
		res += "at path " + d.path + " "
	}

	res += d.valueA + " vs " + d.valueB
	return res
}

export function getDeepDiff(a: unknown, b: unknown, isTopLevel = true): DeepDiff | null {
	if(a === b){
		return null
	}

	if(typeof(a) !== typeof(b)){
		return {
			path: "",
			valueA: anyToString(a),
			valueB: anyToString(b)
		}
	}

	switch(typeof(a)){
		case "string":
		case "boolean":
		case "number":
		case "bigint":
		case "function":
		case "undefined":
		case "symbol":
			return {
				path: "",
				valueA: anyToString(a),
				valueB: anyToString(b)
			}
		case "object":{
			if(a === null || b === null){
				return {
					path: "",
					valueA: JSON.stringify(a),
					valueB: JSON.stringify(b)
				}
			}
			if(Array.isArray(a)){
				if(!Array.isArray(b) || b.length !== a.length){
					return {
						path: "",
						valueA: JSON.stringify(a),
						valueB: JSON.stringify(b)
					}
				}

				for(let i = 0; i < a.length; i++){
					let res = getDeepDiff(a[i], b[i], false)
					if(res){
						res.path = "[" + i + "]" + res.path
						return res
					}
				}

				return null
			}

			let classDiff = getClassDiff(a, b)
			if(classDiff){
				return {
					path: "<class>",
					valueA: classDiff.classAName,
					valueB: classDiff.classBName
				}
			}

			if(a instanceof Set && b instanceof Set){
				for(let v of a){
					if(!b.has(v)){
						return {
							path: "<set value>",
							valueA: anyToString(v),
							valueB: anyToString(undefined)
						}
					}
				}
				for(let v of b){
					if(!a.has(v)){
						return {
							path: "<set value>",
							valueA: anyToString(undefined),
							valueB: anyToString(v)
						}
					}
				}
			}

			if(a instanceof Map && b instanceof Map){
				// not the most efficient way to do this (intersecting keys checked twice)
				for(let key of a.keys()){
					let va = a.get(key)
					let vb = b.get(key)
					let diff = getDeepDiff(va, vb, false)
					if(diff){
						diff.path = "[" + JSON.stringify(key) + "]" + diff.path
						return diff
					}
				}

				for(let key of b.keys()){
					let va = a.get(key)
					let vb = b.get(key)
					let diff = getDeepDiff(va, vb, false)
					if(diff){
						diff.path = "[" + JSON.stringify(key) + "]" + diff.path
						return diff
					}
				}
			}

			let keysA = Object.keys(a)
			let keysB = Object.keys(b as Record<string, unknown>)
			if(keysA.length !== keysB.length){
				let diff = getDeepDiff(keysA, keysB, false)
				if(diff){
					diff.path = "<keyset>" + diff.path
					return diff
				}
			}
			for(let key in a){
				let compResult = getDeepDiff(a[key as keyof(typeof a)], (b as Record<string, unknown>)[key], false)
				if(compResult){
					compResult.path = (isTopLevel ? "" : ".") + JSON.stringify(key) + compResult.path
					return compResult
				}
			}

			return null
		}
		default:
			throw new Error("Unknown type of value: " + typeof(a))
	}
}