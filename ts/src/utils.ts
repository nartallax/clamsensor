export function debounce(time: number, fn: () => void): () => void {
	let timeout: NodeJS.Timeout | null = null;
	return () => {
		if(timeout){
			clearTimeout(timeout);
		}
		timeout = setTimeout(fn, time);
	}
}

export function anyToString(x: unknown): string {
	switch(typeof(x)){
		case "symbol": return x.toString();
		case "object": return x === null? "null": JSON.stringify(x);
		case "string": return JSON.stringify(x);
		default: return x + "";
	}
}