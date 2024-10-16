import {
	argv, cwd, stdout,
} from "node:process"
import process from "node:process"

const onSIGNIT = ( listener: NodeJS.SignalsListener ) => process.on( 'SIGINT', listener )
export const exit = ( code?: number | string | null | undefined ) => process.exit( code )

export const rmDeprecationAlerts = () => {

	// This is not recomended but is for not display `(node:31972) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.` message.
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	process.noDeprecation = true

}

export {
	argv,
	onSIGNIT,
	cwd,
	stdout,
}

