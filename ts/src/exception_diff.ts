import {classDiffToString, getClassDiff} from "class_diff";

export type ClamsensorExceptionSpecification = Error | string | RegExp;

export function getExceptionDiff(spec: ClamsensorExceptionSpecification, ex: Error): string | null {

	if(spec instanceof RegExp){
		let msg = ex.message;
		if(msg.match(spec)){
			return null;
		} else {
			return `expected exception text to match ${spec}, but it is not: ${JSON.stringify(msg)}`
		}
	}

	if(typeof(spec) === "string"){
		if(ex.message === spec){
			return null;
		} else {
			return `expected exception text to be ${JSON.stringify(spec)}, but it is not: ${JSON.stringify(ex.message)}`;
		}
	}

	if(spec.message !== ex.message){
		return `expected exception text to be ${JSON.stringify(spec.message)}, but it is not: ${JSON.stringify(ex.message)}`;
	}

	let diff = getClassDiff(spec, ex);
	if(diff){
		return `exception check failed: ${classDiffToString(diff)}`
	}

	return null;
}