import {
	argv, exit, cwd, stdout,
} from "node:process"
import process from "node:process"

const onSIGNIT = ( listener: NodeJS.SignalsListener ) => process.on( 'SIGINT', listener )

export {
	argv,
	exit,
	onSIGNIT,
	cwd,
	stdout,
}

