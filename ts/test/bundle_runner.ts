import * as ChildProcess from "child_process"

export function runBundle(jsPath: string): Promise<{stdout: string, stderr: string, code: number | null, signal: NodeJS.Signals | null}> {
	return new Promise((ok, bad) => {
		try {
			let res = ChildProcess.spawn(process.argv[0], [jsPath])

			let stderrChunks: Buffer[] = []
			let stdoutChunks: Buffer[] = []

			let onExit = (code: number | null, signal: NodeJS.Signals | null) => {
				ok({
					stdout: Buffer.concat(stdoutChunks).toString("utf8").trim(),
					stderr: Buffer.concat(stderrChunks).toString("utf8").trim(),
					code, signal
				})
			}

			res.on("error", err => bad(err))
			res.on("exit", onExit)
			res.on("close", onExit)
			res.stderr.on("data", chunk => stderrChunks.push(chunk))
			res.stdout.on("data", chunk => stdoutChunks.push(chunk))
		} catch(e){
			bad(e)
		}
	})
}